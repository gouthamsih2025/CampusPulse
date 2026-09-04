from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.enums import TicketStatus, TicketSeverity
from app.schemas.ticket import (
    TicketRead,
    TicketDetailRead,
    TicketCreate,
    TicketUpdate,
    TriageRequest,
    TriageResponse,
    TicketCommentRead,
    TicketCommentCreate,
)
from app.services.ticket_service import TicketService
from app.services.ai_triage import AITriageService

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("/triage-preview", response_model=TriageResponse)
def triage_preview(request: TriageRequest):
    """
    Simulate/preview intelligent NLP extraction on raw campus report text
    before the user submits the ticket.
    """
    return AITriageService.triage_text(request.raw_text)


@router.post("", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket_in: TicketCreate, db: Session = Depends(get_db)):
    """
    Submit a new campus operational issue ticket.
    """
    return TicketService.create_ticket(db, ticket_in)


@router.get("", response_model=List[TicketRead])
def list_tickets(
    status: Optional[TicketStatus] = Query(None, description="Filter by status"),
    severity: Optional[TicketSeverity] = Query(None, description="Filter by severity"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    building: Optional[str] = Query(None, description="Filter by building"),
    search: Optional[str] = Query(None, description="Search across ticket code, title, description, room"),
    reporter_email: Optional[str] = Query(None, description="Filter by student/staff reporter email"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """
    Retrieve tickets with flexible search, filtering, and pagination.
    """
    tickets, _ = TicketService.get_tickets(
        db=db,
        status=status,
        severity=severity,
        category_id=category_id,
        building=building,
        search=search,
        reporter_email=reporter_email,
        skip=skip,
        limit=limit,
    )
    return tickets


@router.get("/{identifier}", response_model=TicketDetailRead)
def get_ticket(identifier: str, db: Session = Depends(get_db)):
    """
    Get detailed information about a ticket by its database ID or ticket code (e.g. CP-2026-104928),
    including full comment chain and audit trail.
    """
    ticket = TicketService.get_ticket_by_id_or_code(db, identifier)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{identifier}' not found."
        )
    return ticket


@router.patch("/{ticket_id}", response_model=TicketRead)
def update_ticket(ticket_id: int, update_data: TicketUpdate, db: Session = Depends(get_db)):
    """
    Update ticket lifecycle (status, priority, technician assignment, category).
    Automatically records state transitions in the audit trail.
    """
    ticket = TicketService.get_ticket_by_id_or_code(db, str(ticket_id))
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket #{ticket_id} not found."
        )
    return TicketService.update_ticket(db, ticket, update_data)


@router.post("/{ticket_id}/comments", response_model=TicketCommentRead, status_code=status.HTTP_201_CREATED)
def add_ticket_comment(ticket_id: int, comment_in: TicketCommentCreate, db: Session = Depends(get_db)):
    """
    Add a communication update or internal note to a ticket.
    """
    ticket = TicketService.get_ticket_by_id_or_code(db, str(ticket_id))
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket #{ticket_id} not found."
        )
    return TicketService.add_comment(db, ticket.id, comment_in)
