from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid, os, aiofiles

from ..core.database import get_db
from ..core.security import get_current_user, require_roles
from ..core.config import settings
from ..core.websocket import manager
from ..models.user import User
from ..models.ticket import Ticket, Attachment
from ..models.log import Log
from ..schemas import (
    TicketCreate, TicketOut, TicketAssign, TicketStatusChange, AttachmentOut
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])

ALLOWED_MIME = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


def _add_log(db, action: str, user: User, ticket_id: Optional[int] = None):
    db.add(Log(action=action, user_id=user.id, ticket_id=ticket_id))


# ─── LIST ─────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[TicketOut])
def list_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assigned_to: Optional[int] = Query(None),
    created_by: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Ticket)

    # Xodim faqat o'z ticketlarini ko'radi
    if current_user.role == "employee":
        q = q.filter(Ticket.created_by == current_user.id)
    # Texnik faqat o'ziga biriktirilganlarni ko'radi
    elif current_user.role == "technician":
        q = q.filter(Ticket.assigned_to == current_user.id)

    if status:
        q = q.filter(Ticket.status == status)
    if priority:
        q = q.filter(Ticket.priority == priority)
    if assigned_to is not None:
        q = q.filter(Ticket.assigned_to == assigned_to)
    if created_by is not None:
        q = q.filter(Ticket.created_by == created_by)

    return q.order_by(Ticket.created_at.desc()).all()


# ─── GET ONE ──────────────────────────────────────────────────────────────────

@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Murojaat topilmadi")

    # Ruxsat tekshirish
    if current_user.role == "employee" and ticket.created_by != current_user.id:
        raise HTTPException(403, "Ruxsat yo'q")
    if current_user.role == "technician" and ticket.assigned_to != current_user.id:
        raise HTTPException(403, "Ruxsat yo'q")

    return ticket


# ─── CREATE ───────────────────────────────────────────────────────────────────

@router.post("/", response_model=TicketOut, status_code=201)
async def create_ticket(
    body: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = Ticket(**body.model_dump(), created_by=current_user.id)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    _add_log(db, f"Yangi murojaat #{ticket.id} yaratildi", current_user, ticket.id)
    db.commit()

    # Dispetcherlarga real-time xabar
    ticket_data = TicketOut.model_validate(ticket).model_dump(mode="json")
    await manager.broadcast_all("ticket:new", ticket_data)

    return ticket


# ─── ASSIGN ───────────────────────────────────────────────────────────────────

@router.patch("/{ticket_id}/assign", response_model=TicketOut)
async def assign_ticket(
    ticket_id: int,
    body: TicketAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("dispatcher", "admin")),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Murojaat topilmadi")

    tech = db.query(User).filter(
        User.id == body.technician_id, User.role == "technician"
    ).first()
    if not tech:
        raise HTTPException(400, "Texnik xodim topilmadi")

    ticket.assigned_to = body.technician_id
    ticket.status = "qabul"
    ticket.assigned_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)

    _add_log(db, f"Murojaat #{ticket_id} → {tech.fullname}ga biriktirildi", current_user, ticket_id)
    db.commit()

    ticket_data = TicketOut.model_validate(ticket).model_dump(mode="json")
    await manager.broadcast_all("ticket:updated", ticket_data)
    # Texnikga shaxsiy xabar
    await manager.send_to_user(tech.id, "ticket:assigned", ticket_data)

    return ticket


# ─── STATUS CHANGE ────────────────────────────────────────────────────────────

@router.patch("/{ticket_id}/status", response_model=TicketOut)
async def change_status(
    ticket_id: int,
    body: TicketStatusChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Murojaat topilmadi")

    # Texnik faqat o'z ticketlarini o'zgartira oladi
    if current_user.role == "technician" and ticket.assigned_to != current_user.id:
        raise HTTPException(403, "Ruxsat yo'q")
    # Xodim status o'zgartira olmaydi
    if current_user.role == "employee":
        raise HTTPException(403, "Ruxsat yo'q")

    ticket.status = body.status
    if body.status == "tugallandi":
        ticket.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)

    _add_log(db, f"Murojaat #{ticket_id} → \"{body.status}\"", current_user, ticket_id)
    db.commit()

    ticket_data = TicketOut.model_validate(ticket).model_dump(mode="json")
    await manager.broadcast_all("ticket:updated", ticket_data)

    return ticket


# ─── FILE UPLOAD ──────────────────────────────────────────────────────────────

@router.post("/{ticket_id}/attachments", response_model=AttachmentOut, status_code=201)
async def upload_attachment(
    ticket_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(404, "Murojaat topilmadi")

    # Hajm tekshirish
    content = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(400, f"Fayl hajmi {settings.MAX_FILE_SIZE_MB} MB dan oshmasin")

    # Mime tekshirish
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(400, "Bu turdagi fayl ruxsat etilmagan")

    # Saqlash
    ext = os.path.splitext(file.filename or "file")[1]
    saved_name = f"{uuid.uuid4().hex}{ext}"
    folder = os.path.join(settings.UPLOAD_DIR, str(ticket_id))
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, saved_name)

    async with aiofiles.open(path, "wb") as f:
        await f.write(content)

    attachment = Attachment(
        ticket_id=ticket_id,
        uploaded_by=current_user.id,
        filename=saved_name,
        original=file.filename or saved_name,
        mime_type=file.content_type,
        size_bytes=len(content),
    )
    db.add(attachment)
    _add_log(db, f"Murojaat #{ticket_id} ga fayl yuklandi: {file.filename}", current_user, ticket_id)
    db.commit()
    db.refresh(attachment)

    return attachment


# ─── DELETE ATTACHMENT ────────────────────────────────────────────────────────

@router.delete("/{ticket_id}/attachments/{att_id}", status_code=204)
async def delete_attachment(
    ticket_id: int,
    att_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "dispatcher")),
):
    att = db.query(Attachment).filter(
        Attachment.id == att_id, Attachment.ticket_id == ticket_id
    ).first()
    if not att:
        raise HTTPException(404, "Fayl topilmadi")

    path = os.path.join(settings.UPLOAD_DIR, str(ticket_id), att.filename)
    if os.path.exists(path):
        os.remove(path)

    db.delete(att)
    db.commit()
