import random
from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc

from app.models.ticket import Ticket, TicketComment, TicketAuditLog
from app.models.category import Category
from app.models.user import User
from app.models.enums import TicketStatus, TicketSeverity
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketCommentCreate
from app.services.ai_triage import AITriageService


class TicketService:

    @staticmethod
    def generate_ticket_code(db: Session) -> str:
        """Generate unique ticket identifier like CP-2026-104928"""
        year = datetime.utcnow().year
        while True:
            rand_num = random.randint(100000, 999999)
            code = f"CP-{year}-{rand_num}"
            existing = db.query(Ticket).filter(Ticket.ticket_code == code).first()
            if not existing:
                return code

    @classmethod
    def create_ticket(cls, db: Session, ticket_in: TicketCreate) -> Ticket:
        # Run AI triage if requested or description exists
        ai_summary = None
        ai_confidence = None
        is_triaged = False

        if ticket_in.auto_triage:
            triage_result = AITriageService.triage_text(ticket_in.description)
            ai_summary = triage_result.summary
            ai_confidence = triage_result.confidence
            is_triaged = True

        code = cls.generate_ticket_code(db)

        db_ticket = Ticket(
            ticket_code=code,
            title=ticket_in.title,
            description=ticket_in.description,
            category_id=ticket_in.category_id,
            building=ticket_in.building,
            room=ticket_in.room,
            severity=ticket_in.severity,
            status=TicketStatus.OPEN,
            reporter_name=ticket_in.reporter_name,
            reporter_email=ticket_in.reporter_email,
            ai_summary=ai_summary,
            ai_confidence=ai_confidence,
            is_ai_triaged=is_triaged,
        )
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)

        # Initial audit log
        audit = TicketAuditLog(
            ticket_id=db_ticket.id,
            actor_name=ticket_in.reporter_name,
            action="TICKET_CREATED",
            old_value=None,
            new_value=f"Created with status {TicketStatus.OPEN.value} and severity {ticket_in.severity.value}",
        )
        db.add(audit)
        db.commit()

        return db_ticket

    @staticmethod
    def get_tickets(
        db: Session,
        status: Optional[TicketStatus] = None,
        severity: Optional[TicketSeverity] = None,
        category_id: Optional[int] = None,
        building: Optional[str] = None,
        search: Optional[str] = None,
        reporter_email: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Ticket], int]:
        query = db.query(Ticket).options(
            joinedload(Ticket.category),
            joinedload(Ticket.assignee),
        )

        if status:
            query = query.filter(Ticket.status == status)
        if severity:
            query = query.filter(Ticket.severity == severity)
        if category_id:
            query = query.filter(Ticket.category_id == category_id)
        if building:
            query = query.filter(Ticket.building.ilike(f"%{building}%"))
        if reporter_email:
            query = query.filter(Ticket.reporter_email == reporter_email)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Ticket.ticket_code.ilike(search_pattern),
                    Ticket.title.ilike(search_pattern),
                    Ticket.description.ilike(search_pattern),
                    Ticket.room.ilike(search_pattern),
                    Ticket.reporter_name.ilike(search_pattern),
                )
            )

        total = query.count()
        tickets = query.order_by(desc(Ticket.created_at)).offset(skip).limit(limit).all()
        return tickets, total

    @staticmethod
    def get_ticket_by_id_or_code(db: Session, identifier: str) -> Optional[Ticket]:
        query = db.query(Ticket).options(
            joinedload(Ticket.category),
            joinedload(Ticket.assignee),
            joinedload(Ticket.comments),
            joinedload(Ticket.audit_logs),
        )
        if identifier.isdigit():
            ticket = query.filter(Ticket.id == int(identifier)).first()
            if ticket:
                return ticket
        return query.filter(Ticket.ticket_code == identifier).first()

    @classmethod
    def update_ticket(cls, db: Session, ticket: Ticket, update_data: TicketUpdate) -> Ticket:
        actor = update_data.admin_actor_name or "Admin Operations"

        # Status update
        if update_data.status and update_data.status != ticket.status:
            old_val = ticket.status.value
            ticket.status = update_data.status
            if update_data.status in (TicketStatus.RESOLVED, TicketStatus.CLOSED):
                ticket.resolved_at = datetime.utcnow()
            
            db.add(TicketAuditLog(
                ticket_id=ticket.id,
                actor_name=actor,
                action="STATUS_CHANGED",
                old_value=old_val,
                new_value=update_data.status.value,
            ))

        # Severity update
        if update_data.severity and update_data.severity != ticket.severity:
            old_val = ticket.severity.value
            ticket.severity = update_data.severity
            db.add(TicketAuditLog(
                ticket_id=ticket.id,
                actor_name=actor,
                action="SEVERITY_CHANGED",
                old_value=old_val,
                new_value=update_data.severity.value,
            ))

        # Assignee update
        if update_data.assigned_to is not None and update_data.assigned_to != ticket.assigned_to:
            old_val = str(ticket.assigned_to) if ticket.assigned_to else "Unassigned"
            ticket.assigned_to = update_data.assigned_to
            assignee = db.query(User).filter(User.id == update_data.assigned_to).first()
            new_val = assignee.full_name if assignee else f"User #{update_data.assigned_to}"
            
            db.add(TicketAuditLog(
                ticket_id=ticket.id,
                actor_name=actor,
                action="ASSIGNED",
                old_value=old_val,
                new_value=new_val,
            ))

        # Category update
        if update_data.category_id and update_data.category_id != ticket.category_id:
            old_cat = ticket.category.name if ticket.category else str(ticket.category_id)
            ticket.category_id = update_data.category_id
            new_cat_obj = db.query(Category).filter(Category.id == update_data.category_id).first()
            new_val = new_cat_obj.name if new_cat_obj else str(update_data.category_id)
            db.add(TicketAuditLog(
                ticket_id=ticket.id,
                actor_name=actor,
                action="CATEGORY_CHANGED",
                old_value=old_cat,
                new_value=new_val,
            ))

        # Resolution notes as internal comment
        if update_data.resolution_notes:
            cls.add_comment(
                db=db,
                ticket_id=ticket.id,
                comment_in=TicketCommentCreate(
                    author_name=actor,
                    author_role="Admin",
                    comment=f"[Resolution Note]: {update_data.resolution_notes}",
                    is_internal=False,
                )
            )

        ticket.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def add_comment(db: Session, ticket_id: int, comment_in: TicketCommentCreate) -> TicketComment:
        comment = TicketComment(
            ticket_id=ticket_id,
            author_name=comment_in.author_name,
            author_role=comment_in.author_role,
            comment=comment_in.comment,
            is_internal=comment_in.is_internal,
        )
        db.add(comment)
        
        # Log comment creation
        audit = TicketAuditLog(
            ticket_id=ticket_id,
            actor_name=comment_in.author_name,
            action="COMMENT_ADDED",
            old_value=None,
            new_value=comment_in.comment[:50] + ("..." if len(comment_in.comment) > 50 else ""),
        )
        db.add(audit)
        
        db.commit()
        db.refresh(comment)
        return comment
