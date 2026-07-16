from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id           = Column(Integer, primary_key=True, index=True)
    fullname     = Column(String(120), nullable=False)
    department   = Column(String(100), nullable=False)
    phone        = Column(String(30), nullable=False)
    problem_type = Column(String(60), nullable=False)
    description  = Column(Text, nullable=False)
    priority     = Column(String(20), default="orta")   # yuqori | orta | past
    status       = Column(String(20), default="yangi")  # yangi | qabul | jarayon | tugallandi | bekor

    created_by   = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to  = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at   = Column(DateTime, default=datetime.utcnow)
    assigned_at  = Column(DateTime, nullable=True)
    resolved_at  = Column(DateTime, nullable=True)

    # Relationships
    creator     = relationship("User", back_populates="created_tickets",  foreign_keys=[created_by])
    technician  = relationship("User", back_populates="assigned_tickets", foreign_keys=[assigned_to])
    attachments = relationship("Attachment", back_populates="ticket", cascade="all, delete-orphan")
    logs        = relationship("Log", back_populates="ticket", cascade="all, delete-orphan")


class Attachment(Base):
    __tablename__ = "attachments"

    id          = Column(Integer, primary_key=True, index=True)
    ticket_id   = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"),   nullable=False)
    filename    = Column(String(255), nullable=False)   # saqlangan nom (UUID-based)
    original    = Column(String(255), nullable=False)   # original fayl nomi
    mime_type   = Column(String(80),  nullable=False)
    size_bytes  = Column(Integer,     nullable=False)
    uploaded_at = Column(DateTime,    default=datetime.utcnow)

    ticket   = relationship("Ticket",     back_populates="attachments")
    uploader = relationship("User",       back_populates="attachments")
