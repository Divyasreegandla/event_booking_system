from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from datetime import datetime
from app.models.review import Review
from app.models.booking import Booking, BookingStatus
from app.models.event import Event
from app.schemas.review import ReviewCreate, ReviewUpdate


class ReviewService:
    def __init__(self, db: Session):
        self.db = db
    
    def can_user_review(self, user_id: int, event_id: int) -> bool:
        booking = self.db.query(Booking).filter(
            Booking.user_id == user_id,
            Booking.event_id == event_id,
            Booking.status == BookingStatus.CONFIRMED
        ).first()
        
        if not booking:
            return False
        
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if event and event.event_date > datetime.now():
            return False
        
        return True
    
    def create_review(self, user_id: int, event_id: int, review_data: ReviewCreate):
        if not self.can_user_review(user_id, event_id):
            raise HTTPException(
                status_code=403,
                detail="You can only review events you have attended"
            )
        
        existing_review = self.db.query(Review).filter(
            Review.user_id == user_id,
            Review.event_id == event_id
        ).first()
        
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already reviewed this event")
        
        review = Review(
            user_id=user_id,
            event_id=event_id,
            rating=review_data.rating,
            review_text=review_data.review_text
        )
        
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        
        return review
    
    def update_review(self, user_id: int, review_id: int, review_data: ReviewUpdate):
        review = self.db.query(Review).filter(
            Review.id == review_id,
            Review.user_id == user_id
        ).first()
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        if review_data.rating is not None:
            review.rating = review_data.rating
        if review_data.review_text is not None:
            review.review_text = review_data.review_text
        
        self.db.commit()
        self.db.refresh(review)
        
        return review
    
    def delete_review(self, user_id: int, review_id: int):
        review = self.db.query(Review).filter(
            Review.id == review_id,
            Review.user_id == user_id
        ).first()
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
        
        self.db.delete(review)
        self.db.commit()
        
        return {"message": "Review deleted successfully"}
    
    def get_event_reviews(self, event_id: int, skip: int = 0, limit: int = 50):
        from app.models.user import User
        
        reviews = self.db.query(Review, User.username).join(
            User, Review.user_id == User.id
        ).filter(
            Review.event_id == event_id
        ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
        
        result = []
        for review, username in reviews:
            result.append({
                "id": review.id,
                "user_id": review.user_id,
                "username": username,
                "rating": review.rating,
                "review_text": review.review_text,
                "created_at": review.created_at,
                "updated_at": review.updated_at
            })
        
        return result
    
    def get_event_rating_stats(self, event_id: int):
        stats = self.db.query(
            func.avg(Review.rating).label('average_rating'),
            func.count(Review.id).label('total_reviews')
        ).filter(Review.event_id == event_id).first()
        
        distribution = {}
        for i in range(1, 6):
            count = self.db.query(Review).filter(
                Review.event_id == event_id,
                Review.rating == i
            ).count()
            distribution[str(i)] = count
        
        return {
            "event_id": event_id,
            "average_rating": round(stats.average_rating or 0, 2),
            "total_reviews": stats.total_reviews or 0,
            "rating_distribution": distribution
        }
    
    def get_user_reviews(self, user_id: int):
        reviews = self.db.query(Review).filter(Review.user_id == user_id).all()
        return reviews