from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import DashboardAnalytics
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardAnalytics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Retrieve aggregated operational metrics:
    - Counts by status & severity
    - Average turnaround hours
    - Breakdown by department / category
    - Campus hotspot locations
    - Activity trend timeline
    """
    return AnalyticsService.get_dashboard_analytics(db)
