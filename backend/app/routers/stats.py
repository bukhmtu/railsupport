from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..core.database import get_db
from ..core.security import require_roles
from ..core.websocket import manager
from ..models.ticket import Ticket
from ..models.user import User
from ..models.log import Log
from ..schemas import StatsOut, LogOut

router = APIRouter(tags=["Stats & Logs"])


@router.get("/stats", response_model=StatsOut)
def get_stats(
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin", "dispatcher")),
):
    tickets = db.query(Ticket).all()
    total = len(tickets)

    by_status = {}
    for t in tickets:
        by_status[t.status] = by_status.get(t.status, 0) + 1

    by_category = {}
    for t in tickets:
        by_category[t.problem_type] = by_category.get(t.problem_type, 0) + 1

    by_priority = {}
    for t in tickets:
        by_priority[t.priority] = by_priority.get(t.priority, 0) + 1

    # KPI: har bir texnik uchun tugallangan / jami biriktirilgan
    technicians = db.query(User).filter(User.role == "technician").all()
    kpi = []
    for tech in technicians:
        assigned = [t for t in tickets if t.assigned_to == tech.id]
        completed = [t for t in assigned if t.status == "tugallandi"]
        kpi.append({
            "id": tech.id,
            "fullname": tech.fullname,
            "assigned": len(assigned),
            "completed": len(completed),
            "in_progress": len([t for t in assigned if t.status in ("qabul", "jarayon")]),
        })

    return StatsOut(
        total=total,
        yangi=by_status.get("yangi", 0),
        jarayon=by_status.get("jarayon", 0) + by_status.get("qabul", 0),
        tugallandi=by_status.get("tugallandi", 0),
        bekor=by_status.get("bekor", 0),
        by_category=by_category,
        by_priority=by_priority,
        technician_kpi=kpi,
        online_users=manager.online_count(),
    )


@router.get("/logs", response_model=List[LogOut])
def get_logs(
    db: Session = Depends(get_db),
    _=Depends(require_roles("admin")),
):
    logs = (
        db.query(Log)
        .order_by(Log.time.desc())
        .limit(200)
        .all()
    )
    result = []
    for log in logs:
        result.append(LogOut(
            id=log.id,
            action=log.action,
            user_id=log.user_id,
            ticket_id=log.ticket_id,
            time=log.time,
            user_fullname=log.user_rel.fullname if log.user_rel else None,
        ))
    return result
