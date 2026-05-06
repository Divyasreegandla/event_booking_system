from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user
from app.models.user import User
from app.services.recommendation_service import RecommendationService

router = APIRouter()


@router.get("/personalized")
async def get_personalized_recommendations(
    limit: int = Query(6, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized event recommendations for the user"""
    recommendation_service = RecommendationService(db)
    recommendations = recommendation_service.get_personalized_recommendations(
        current_user.id, limit
    )
    return {"recommendations": recommendations, "count": len(recommendations)}


@router.get("/trending")
async def get_trending_events(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get trending events based on recent activity"""
    recommendation_service = RecommendationService(db)
    trending = recommendation_service.get_trending_events(limit)
    return {"trending": trending, "count": len(trending)}


@router.get("/similar/{event_id}")
async def get_similar_events(
    event_id: int,
    limit: int = Query(4, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get events similar to a given event"""
    recommendation_service = RecommendationService(db)
    similar = recommendation_service.get_similar_events(event_id, limit)
    return {"similar_events": similar, "count": len(similar)}


@router.post("/track/{event_id}")
async def track_event_view(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track that a user viewed an event (for recommendations)"""
    recommendation_service = RecommendationService(db)
    recommendation_service.track_user_activity(current_user.id, event_id, "view")
    return {"message": "Activity tracked"}