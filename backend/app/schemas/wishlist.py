from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WishlistItemResponse(BaseModel):
    id: int
    event_id: int
    event_title: str
    event_category: Optional[str]
    event_date: datetime
    event_price: float
    event_image_url: Optional[str]
    event_city: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AddToWishlistRequest(BaseModel):
    event_id: int

class WishlistResponse(BaseModel):
    items: list[WishlistItemResponse]
    total: int