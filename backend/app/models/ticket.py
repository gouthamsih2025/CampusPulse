from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, Enum as SQLEnum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import TicketSeverity, TicketStatus


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Location info
    building = Column(String(100), nullable=False, index=True)
    room = Column(String(100), nullable=False)
    
    # Priority & Lifecycle
    severity = Column(SQLEnum(TicketSeverity), default=TicketSeverity.MEDIUM, nullable=False, index=True)
    status = Column(SQLEnum(TicketStatus), default=TicketStatus.OPEN, nullable=False, index=True)
    
    # Reporter details
    reporter_name = Column(String(255), nullable=False)
    reporter_email = Column(String(255), nullable=False, index=True)
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    # AI Triage outputs
    ai_summary = Column(Text, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    is_ai_triaged = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    category = relationship("Category", back_populates="tickets")
    assignee = relationship("User", back_populates="assigned_tickets", foreign_keys=[assigned_to])
    comments = relationship("TicketComment", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketComment.created_at.asc()")
    audit_logs = relationship("TicketAuditLog", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketAuditLog.created_at.desc()")


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False, index=True)
    author_name = Column(String(255), nullable=False)
    author_role = Column(String(50), default="Student", nullable=False)
    comment = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    ticket = relationship("Ticket", back_populates="comments")


class TicketAuditLog(Base):
    __tablename__ = "ticket_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False, index=True)
    actor_name = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)
    old_value = Column(String(255), nullable=True)
    new_value = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    ticket = relationship("Ticket", back_populates="audit_logs")
