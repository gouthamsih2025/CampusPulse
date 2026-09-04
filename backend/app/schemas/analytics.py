from typing import List, Dict, Any
from pydantic import BaseModel


class CategoryStat(BaseModel):
    category_name: str
    count: int
    resolved_count: int


class SeverityStat(BaseModel):
    severity: str
    count: int


class StatusStat(BaseModel):
    status: str
    count: int


class BuildingHotspot(BaseModel):
    building: str
    count: int
    open_count: int
    high_priority_count: int


class DashboardAnalytics(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    critical_tickets: int
    avg_resolution_hours: float
    by_category: List[CategoryStat]
    by_severity: List[SeverityStat]
    by_status: List[StatusStat]
    hotspot_buildings: List[BuildingHotspot]
    recent_activity_trend: List[Dict[str, Any]]
