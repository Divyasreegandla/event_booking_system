from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from app.database.session import get_db
from app.models.event import Event
from app.schemas.event import EventResponse

router = APIRouter()

@router.get("/", response_model=List[EventResponse])
async def get_events(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Event).filter(Event.is_active == True)
    
    if category:
        query = query.filter(Event.category == category)
    if city:
        query = query.filter(Event.city == city)
    if search:
        query = query.filter(
            (Event.title.contains(search)) | (Event.description.contains(search))
        )
    
    events = query.offset(skip).limit(limit).all()
    return events

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Get all unique event categories"""
    try:
        # Query distinct non-null categories
        result = db.query(Event.category).filter(
            Event.is_active == True,
            Event.category.isnot(None)
        ).distinct().all()
        
        # Convert to list
        categories = [row[0] for row in result if row[0]]
        
        # Return defaults if empty
        if not categories:
            categories = ["Music", "Tech", "Sports", "Business"]
        
        return categories
        
    except Exception:
        # On any error, return defaults
        return ["Music", "Tech", "Sports", "Business"]