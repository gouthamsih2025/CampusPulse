from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.ticket import Ticket
from app.models.category import Category
from app.models.enums import TicketStatus, TicketSeverity
from app.schemas.analytics import (
    DashboardAnalytics,
    CategoryStat,
    SeverityStat,
    StatusStat,
    BuildingHotspot,
)


class AnalyticsService:

    @staticmethod
    def get_dashboard_analytics(db: Session) -> DashboardAnalytics:
        total = db.query(func.count(Ticket.id)).scalar() or 0
        open_count = db.query(func.count(Ticket.id)).filter(Ticket.status == TicketStatus.OPEN).scalar() or 0
        in_progress_count = db.query(func.count(Ticket.id)).filter(Ticket.status == TicketStatus.IN_PROGRESS).scalar() or 0
        resolved_count = db.query(func.count(Ticket.id)).filter(Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED])).scalar() or 0
        critical_count = db.query(func.count(Ticket.id)).filter(Ticket.severity == TicketSeverity.CRITICAL).scalar() or 0

        # Average turnaround calculation (for resolved tickets)
        resolved_tickets = db.query(Ticket.created_at, Ticket.resolved_at).filter(Ticket.resolved_at.isnot(None)).all()
        avg_hours = 0.0
        if resolved_tickets:
            diffs = [(r.resolved_at - r.created_at).total_seconds() / 3600.0 for r in resolved_tickets if r.resolved_at]
            if diffs:
                avg_hours = round(sum(diffs) / len(diffs), 1)

        # By Category
        cat_counts = (
            db.query(
                Category.name,
                func.count(Ticket.id).label("total"),
                func.sum(func.case((Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]), 1), else_=0)).label("resolved"),
            )
            .outerjoin(Ticket, Ticket.category_id == Category.id)
            .group_by(Category.name)
            .all()
        )
        by_category = [
            CategoryStat(
                category_name=row[0],
                count=row[1] or 0,
                resolved_count=row[2] or 0,
            )
            for row in cat_counts
        ]

        # By Severity
        sev_counts = (
            db.query(Ticket.severity, func.count(Ticket.id))
            .group_by(Ticket.severity)
            .all()
        )
        by_severity = [
            SeverityStat(severity=row[0].value if hasattr(row[0], "value") else str(row[0]), count=row[1])
            for row in sev_counts
        ]

        # By Status
        stat_counts = (
            db.query(Ticket.status, func.count(Ticket.id))
            .group_by(Ticket.status)
            .all()
        )
        by_status = [
            StatusStat(status=row[0].value if hasattr(row[0], "value") else str(row[0]), count=row[1])
            for row in stat_counts
        ]

        # Hotspot Buildings
        building_counts = (
            db.query(
                Ticket.building,
                func.count(Ticket.id).label("total"),
                func.sum(func.case((Ticket.status == TicketStatus.OPEN, 1), else_=0)).label("open_c"),
                func.sum(func.case((Ticket.severity.in_([TicketSeverity.HIGH, TicketSeverity.CRITICAL]), 1), else_=0)).label("high_c"),
            )
            .group_by(Ticket.building)
            .order_by(func.count(Ticket.id).desc())
            .limit(6)
            .all()
        )
        hotspots = [
            BuildingHotspot(
                building=row[0],
                count=row[1] or 0,
                open_count=row[2] or 0,
                high_priority_count=row[3] or 0,
            )
            for row in building_counts
        ]

        # Recent 7 days trend
        today = datetime.utcnow().date()
        recent_trend = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            start_dt = datetime.combine(day, datetime.min.time())
            end_dt = datetime.combine(day, datetime.max.time())
            count_day = (
                db.query(func.count(Ticket.id))
                .filter(Ticket.created_at >= start_dt, Ticket.created_at <= end_dt)
                .scalar()
                or 0
            )
            recent_trend.append({
                "date": day.strftime("%b %d"),
                "new_tickets": count_day
            })

        return DashboardAnalytics(
            total_tickets=total,
            open_tickets=open_count,
            in_progress_tickets=in_progress_count,
            resolved_tickets=resolved_count,
            critical_tickets=critical_count,
            avg_resolution_hours=avg_hours,
            by_category=by_category,
            by_severity=by_severity,
            by_status=by_status,
            hotspot_buildings=hotspots,
            recent_activity_trend=recent_trend,
        )
