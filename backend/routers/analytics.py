"""
Analytics Router - Provides dashboard data from query logs.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from models import QueryLog, Document
from auth import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])
security = HTTPBearer()


# Response models
class CategoryCount(BaseModel):
    name: str
    queries: int
    fill: str


class DailyTrend(BaseModel):
    day: str
    Support: int
    HR: int
    Marketing: int
    IT: int
    Finance: int


class RecentQuery(BaseModel):
    id: int
    query: str
    category: str
    responseTime: str
    status: str
    timestamp: str


class DashboardStats(BaseModel):
    totalQueries: int
    documentsIndexed: int
    resolutionRate: float
    avgResponseTime: float


class DashboardData(BaseModel):
    stats: DashboardStats
    categoryData: List[CategoryCount]
    weeklyTrend: List[DailyTrend]
    recentQueries: List[RecentQuery]


# Category colors for charts
CATEGORY_COLORS = {
    "Support": "#6366f1",
    "HR": "#8b5cf6",
    "Marketing": "#f59e0b",
    "IT": "#10b981",
    "Finance": "#ef4444"
}


def get_time_ago(created_at: datetime) -> str:
    """Convert datetime to human-readable 'X min ago' format."""
    # Handle both timezone-aware and naive datetimes
    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        # If naive, assume UTC
        created_at = created_at.replace(tzinfo=timezone.utc)
    diff = now - created_at
    
    if diff.total_seconds() < 60:
        return "just now"
    elif diff.total_seconds() < 3600:
        mins = int(diff.total_seconds() / 60)
        return f"{mins} min ago"
    elif diff.total_seconds() < 86400:
        hours = int(diff.total_seconds() / 3600)
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    else:
        days = int(diff.total_seconds() / 86400)
        return f"{days} day{'s' if days > 1 else ''} ago"


@router.get("/dashboard", response_model=DashboardData)
def get_dashboard_data(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Get all dashboard data in a single request."""
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    # Get category counts
    category_counts = db.query(
        QueryLog.category,
        func.count(QueryLog.id).label("count")
    ).group_by(QueryLog.category).all()
    
    category_data = []
    for category in ["Support", "HR", "Marketing", "IT", "Finance"]:
        count = next((c[1] for c in category_counts if c[0] == category), 0)
        category_data.append(CategoryCount(
            name=category,
            queries=count,
            fill=CATEGORY_COLORS.get(category, "#6366f1")
        ))
    
    # Get weekly trend (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    weekly_data = db.query(
        func.date_trunc('day', QueryLog.created_at).label('day'),
        QueryLog.category,
        func.count(QueryLog.id).label('count')
    ).filter(
        QueryLog.created_at >= seven_days_ago
    ).group_by('day', QueryLog.category).all()
    
    # Organize by day
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_trend = []
    
    for i in range(7):
        target_date = (datetime.utcnow() - timedelta(days=6-i)).date()
        day_name = day_names[target_date.weekday()]
        
        day_data = {"day": day_name, "Support": 0, "HR": 0, "Marketing": 0, "IT": 0, "Finance": 0}
        
        for row in weekly_data:
            if row[0] and row[0].date() == target_date:
                day_data[row[1]] = row[2]
        
        weekly_trend.append(DailyTrend(**day_data))
    
    # Get recent queries (last 20)
    recent = db.query(QueryLog).order_by(QueryLog.created_at.desc()).limit(20).all()
    
    recent_queries = []
    for q in recent:
        recent_queries.append(RecentQuery(
            id=q.id,
            query=q.query_text[:100] + "..." if len(q.query_text) > 100 else q.query_text,
            category=q.category,
            responseTime=f"{q.response_time_ms / 1000:.1f}s" if q.response_time_ms else "N/A",
            status=q.status,
            timestamp=get_time_ago(q.created_at)
        ))
    
    # Calculate stats
    total_queries = db.query(func.count(QueryLog.id)).scalar() or 0
    documents_indexed = db.query(func.count(Document.id)).scalar() or 0
    
    resolved_count = db.query(func.count(QueryLog.id)).filter(
        QueryLog.status == "Resolved"
    ).scalar() or 0
    
    resolution_rate = (resolved_count / total_queries * 100) if total_queries > 0 else 0
    
    avg_response = db.query(func.avg(QueryLog.response_time_ms)).scalar() or 0
    
    stats = DashboardStats(
        totalQueries=total_queries,
        documentsIndexed=documents_indexed,
        resolutionRate=round(resolution_rate, 1),
        avgResponseTime=round(avg_response / 1000, 2) if avg_response else 0
    )
    
    return DashboardData(
        stats=stats,
        categoryData=category_data,
        weeklyTrend=weekly_trend,
        recentQueries=recent_queries
    )


@router.get("/categories")
def get_category_breakdown(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Get query counts by category."""
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    counts = db.query(
        QueryLog.category,
        func.count(QueryLog.id).label("count")
    ).group_by(QueryLog.category).all()
    
    return {
        "categories": [
            {"name": c[0], "count": c[1], "color": CATEGORY_COLORS.get(c[0], "#6366f1")}
            for c in counts
        ]
    }
