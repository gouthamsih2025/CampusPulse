from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.enums import TicketSeverity, TicketStatus
from app.schemas.category import CategoryRead
from app.schemas.user import UserRead


# --- AI Triage Schema ---
class TriageRequest(BaseModel):
    raw_text: str


class TriageResponse(BaseModel):
    category_name: str
    suggested_title: str
    building: str
    room: str
    severity: TicketSeverity
    summary: str
    confidence: float
    hazard_detected: bool
    explanation: str


# --- Ticket Comment Schemas ---
class TicketCommentBase(BaseModel):
    author_name: str
    author_role: str = "Student"
    comment: str
    is_internal: bool = False


class TicketCommentCreate(TicketCommentBase):
    pass


class TicketCommentRead(TicketCommentBase):
    id: int
    ticket_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Ticket Audit Log Schema ---
class TicketAuditLogRead(BaseModel):
    id: int
    ticket_id: int
    actor_name: str
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Main Ticket Schemas ---
class TicketBase(BaseModel):
    title: str
    description: str
    category_id: int
    building: str
    room: str
    severity: TicketSeverity = TicketSeverity.MEDIUM
    reporter_name: str
    reporter_email: EmailStr


class TicketCreate(TicketBase):
    auto_triage: Optional[bool] = True


class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    severity: Optional[TicketSeverity] = None
    assigned_to: Optional[int] = None
    category_id: Optional[int] = None
    admin_actor_name: Optional[str] = "Admin Operations"
    resolution_notes: Optional[str] = None


class TicketRead(TicketBase):
    id: int
    ticket_code: str
    status: TicketStatus
    assigned_to: Optional[int] = None
    ai_summary: Optional[str] = None
    ai_confidence: Optional[float] = None
    is_ai_triaged: bool
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    category: Optional[CategoryRead] = None
    assignee: Optional[UserRead] = None

    model_config = ConfigDict(from_attributes=True)


class TicketDetailRead(TicketRead):
    comments: List[TicketCommentRead] = []
    audit_logs: List[TicketAuditLogRead] = []

    model_config = ConfigDict(from_attributes=True)
