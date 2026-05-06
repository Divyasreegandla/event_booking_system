from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class EventUpdateCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    update_type: str = Field("announcement", pattern="^(announcement|reminder|change|cancellation)$")

class EventUpdateResponse(BaseModel):
    id: int
    event_id: int
    message: str
    update_type: str
    created_by: int
    created_by_name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True