from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    fullname   = Column(String(120), nullable=False)
    username   = Column(String(60), unique=True, index=True, nullable=False)
    password   = Column(String(200), nullable=False)  # bcrypt hash
    role       = Column(String(20), nullable=False)   # admin | dispatcher | technician | employee
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    created_tickets  = relationship("Ticket", back_populates="creator",   foreign_keys="Ticket.created_by")
    assigned_tickets = relationship("Ticket", back_populates="technician", foreign_keys="Ticket.assigned_to")
    logs             = relationship("Log", back_populates="user_rel")
    attachments      = relationship("Attachment", back_populates="uploader")
