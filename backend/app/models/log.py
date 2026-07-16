from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Log(Base):
    __tablename__ = "logs"

    id        = Column(Integer, primary_key=True, index=True)
    action    = Column(Text,        nullable=False)
    user_id   = Column(Integer,     ForeignKey("users.id"), nullable=True)
    ticket_id = Column(Integer,     ForeignKey("tickets.id"), nullable=True)
    time      = Column(DateTime,    default=datetime.utcnow)

    user_rel = relationship("User",   back_populates="logs")
    ticket   = relationship("Ticket", back_populates="logs")
