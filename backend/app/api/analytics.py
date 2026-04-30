from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.session import get_db
from app.dependencies.roles import require_admin, require_organizer
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter()

# Admin Analytics endpoints
@router.get("/admin/platform-stats")
async def get_platform_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    analytics_service = AnalyticsService(db)
    return analytics_service.get_platform_stats()

@router.get("/admin/daily-sales")
async def get_daily_sales(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    analytics_service = AnalyticsService(db)
    return analytics_service.get_daily_sales(days)

@router.get("/admin/monthly-trends")
async def get_monthly_trends(
    months: int = Query(12, ge=1, le=36),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    analytics_service = AnalyticsService(db)
    return analytics_service.get_monthly_trends(months)

@router.get("/admin/popular-events")
async def get_popular_events(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    analytics_service = AnalyticsService(db)
    return analytics_service.get_popular_events(limit)

# Organizer Analytics endpoints - FILTERED by organizer_id
@router.get("/organizer/event-stats")
async def get_organizer_event_stats(
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    analytics_service = AnalyticsService(db)
    # Only return stats for events owned by this organizer
    return analytics_service.get_organizer_event_stats(current_user.id)

@router.get("/organizer/dashboard-stats")
async def get_organizer_dashboard_stats(
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    analytics_service = AnalyticsService(db)
    # Only return dashboard stats for events owned by this organizer
    return analytics_service.get_organizer_dashboard_stats(current_user.id)