from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user
from app.models.user import User
from app.services.review_service import ReviewService
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse, EventRatingResponse

router = APIRouter()


@router.post("/{event_id}")
async def create_review(
    event_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review_service = ReviewService(db)
    review = review_service.create_review(current_user.id, event_id, review_data)
    
    return {
        "id": review.id,
        "user_id": review.user_id,
        "username": current_user.username,
        "event_id": review.event_id,
        "rating": review.rating,
        "review_text": review.review_text,
        "created_at": review.created_at,
        "updated_at": review.updated_at
    }


@router.put("/{review_id}")
async def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review_service = ReviewService(db)
    review = review_service.update_review(current_user.id, review_id, review_data)
    
    return {
        "id": review.id,
        "user_id": review.user_id,
        "username": current_user.username,
        "event_id": review.event_id,
        "rating": review.rating,
        "review_text": review.review_text,
        "created_at": review.created_at,
        "updated_at": review.updated_at
    }


@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review_service = ReviewService(db)
    return review_service.delete_review(current_user.id, review_id)


@router.get("/event/{event_id}")
async def get_event_reviews(
    event_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    review_service = ReviewService(db)
    reviews = review_service.get_event_reviews(event_id, skip, limit)
    return {"reviews": reviews, "count": len(reviews)}


@router.get("/event/{event_id}/stats", response_model=EventRatingResponse)
async def get_event_rating_stats(
    event_id: int,
    db: Session = Depends(get_db)
):
    review_service = ReviewService(db)
    return review_service.get_event_rating_stats(event_id)


@router.get("/my-reviews")
async def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review_service = ReviewService(db)
    reviews = review_service.get_user_reviews(current_user.id)
    return {"reviews": reviews}