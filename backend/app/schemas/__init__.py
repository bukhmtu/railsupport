from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ─── User ────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    fullname: str
    username: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    fullname: str
    username: str
    password: str
    role: str

    @field_validator("role")
    @classmethod
    def role_valid(cls, v):
        allowed = {"admin", "dispatcher", "technician", "employee"}
        if v not in allowed:
            raise ValueError(f"Role {allowed} dan biri bo'lishi kerak")
        return v

class UserUpdate(BaseModel):
    fullname: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


# ─── Attachment ───────────────────────────────────────────────────────────────

class AttachmentOut(BaseModel):
    id: int
    filename: str
    original: str
    mime_type: str
    size_bytes: int
    uploaded_at: datetime
    uploaded_by: int

    model_config = {"from_attributes": True}


# ─── Ticket ───────────────────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    fullname: str
    department: str
    phone: str
    problem_type: str
    description: str
    priority: str = "orta"

    @field_validator("priority")
    @classmethod
    def priority_valid(cls, v):
        if v not in {"yuqori", "orta", "past"}:
            raise ValueError("Priority: yuqori | orta | past")
        return v

class TicketOut(BaseModel):
    id: int
    fullname: str
    department: str
    phone: str
    problem_type: str
    description: str
    priority: str
    status: str
    created_by: int
    assigned_to: Optional[int]
    created_at: datetime
    assigned_at: Optional[datetime]
    resolved_at: Optional[datetime]
    attachments: List[AttachmentOut] = []

    model_config = {"from_attributes": True}

class TicketAssign(BaseModel):
    technician_id: int

class TicketStatusChange(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def status_valid(cls, v):
        allowed = {"yangi", "qabul", "jarayon", "tugallandi", "bekor"}
        if v not in allowed:
            raise ValueError(f"Status {allowed} dan biri bo'lishi kerak")
        return v


# ─── Log ─────────────────────────────────────────────────────────────────────

class LogOut(BaseModel):
    id: int
    action: str
    user_id: Optional[int]
    ticket_id: Optional[int]
    time: datetime
    user_fullname: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Stats ───────────────────────────────────────────────────────────────────

class StatsOut(BaseModel):
    total: int
    yangi: int
    jarayon: int
    tugallandi: int
    bekor: int
    by_category: dict
    by_priority: dict
    technician_kpi: List[dict]
    online_users: int

TokenResponse.model_rebuild()
