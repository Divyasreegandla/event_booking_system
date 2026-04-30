from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from enum import Enum

class EventStatus(str, Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class EventCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    category: str
    venue: str
    city: str
    event_date: datetime
    price: float = Field(..., gt=0)
    total_tickets: int = Field(..., gt=0)
    image_url: Optional[str] = None
    
    @validator('event_date')
    def future_date(cls, v):
        if v <= datetime.now():
            raise ValueError('Event date must be in the future')
        return v

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    event_date: Optional[datetime] = None
    price: Optional[float] = None
    total_tickets: Optional[int] = None
    image_url: Optional[str] = None
    event_status: Optional[EventStatus] = None

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    venue: str
    city: Optional[str] = None
    event_date: datetime
    price: float
    total_tickets: int
    available_tickets: int
    image_url: Optional[str] = None
    is_active: bool = True
    organizer_id: int
    event_status: str
    organizer_name: Optional[str] = None
    
    class Config:
        from_attributes = True