from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List

class BookingCreate(BaseModel):
    event_id: int
    quantity: int = Field(..., gt=0, le=10)
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v > 10:
            raise ValueError('Maximum 10 tickets per booking')
        return v

class BookingResponse(BaseModel):
    id: int
    booking_reference: str
    event_id: int
    quantity: int
    total_price: float
    status: str
    created_at: datetime
    booking_date: datetime
    
    class Config:
        from_attributes = True

class TicketVerificationResponse(BaseModel):
    valid: bool
    event_title: str
    event_date: datetime
    venue: str
    user_id: int
    booking_reference: str
    ticket_code: str
    message: str
    
    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    status: str
    
    @validator('status')
    def validate_status(cls, v):
        if v not in ['pending', 'confirmed', 'cancelled']:
            raise ValueError('Status must be pending, confirmed, or cancelled')
        return v

class TicketResponse(BaseModel):
    id: int
    ticket_code: str
    qr_code: Optional[str]
    is_used: bool
    booking_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class BookingCreateWithCoupon(BaseModel):
    event_id: int
    quantity: int = Field(..., gt=0, le=10)
    coupon_code: Optional[str] = Field(None, min_length=3, max_length=50)
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v > 10:
            raise ValueError('Maximum 10 tickets per booking')
        return v