from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = Field(None, max_length=1000)
    
    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = Field(None, max_length=1000)


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    username: str
    event_id: int
    rating: int
    review_text: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class EventRatingResponse(BaseModel):
    event_id: int
    average_rating: float
    total_reviews: int
    rating_distribution: dict