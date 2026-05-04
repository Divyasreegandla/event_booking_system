from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.event import Event
from app.schemas.event import EventResponse, EventCreate, EventUpdate
from app.services.event_service import EventService
from app.dependencies.roles import get_current_user, require_organizer, require_admin
from app.models.user import User

router = APIRouter()

# Public endpoints - anyone can view events
@router.get("/", response_model=List[EventResponse])
async def get_events(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
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
    if status:
        query = query.filter(Event.event_status == status)
    
    events = query.offset(skip).limit(limit).all()
    
    # Add organizer name to response
    result = []
    for event in events:
        event_dict = {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "category": event.category,
            "venue": event.venue,
            "city": event.city,
            "event_date": event.event_date,
            "price": event.price,
            "total_tickets": event.total_tickets,
            "available_tickets": event.available_tickets,
            "image_url": event.image_url,
            "is_active": event.is_active,
            "organizer_id": event.organizer_id,
            "event_status": event.event_status.value if event.event_status else "UPCOMING",
            "organizer_name": event.organizer.username if event.organizer else None
        }
        result.append(event_dict)
    
    return result


@router.get("/advanced-search")
async def advanced_search_events(
    search: Optional[str] = Query(None, description="Search by title or description"),
    category: Optional[str] = Query(None, description="Event category"),
    city: Optional[str] = Query(None, description="Event city"),
    start_date: Optional[datetime] = Query(None, description="Start date for date range"),
    end_date: Optional[datetime] = Query(None, description="End date for date range"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    sort_by: Optional[str] = Query("date", description="Sort by: date, popularity, price_low, price_high"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Advanced search with multiple filters and sorting options"""
    query = db.query(Event).filter(Event.is_active == True)
    
    # Text search
    if search:
        query = query.filter(
            (Event.title.ilike(f"%{search}%")) | 
            (Event.description.ilike(f"%{search}%"))
        )
    
    # Category filter
    if category:
        query = query.filter(Event.category == category)
    
    # City filter
    if city:
        query = query.filter(Event.city.ilike(f"%{city}%"))
    
    # Date range filter
    if start_date:
        query = query.filter(Event.event_date >= start_date)
    if end_date:
        query = query.filter(Event.event_date <= end_date)
    
    # Price range filter
    if min_price is not None:
        query = query.filter(Event.price >= min_price)
    if max_price is not None:
        query = query.filter(Event.price <= max_price)
    
    # Sorting
    if sort_by == "date":
        query = query.order_by(Event.event_date.asc())
    elif sort_by == "popularity":
        # This is simplified - for real popularity, you'd join with bookings
        query = query.order_by(Event.total_tickets.desc())
    elif sort_by == "price_low":
        query = query.order_by(Event.price.asc())
    elif sort_by == "price_high":
        query = query.order_by(Event.price.desc())
    
    total = query.count()
    events = query.offset(skip).limit(limit).all()
    
    result = []
    for event in events:
        result.append({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "category": event.category,
            "venue": event.venue,
            "city": event.city,
            "event_date": event.event_date,
            "price": event.price,
            "total_tickets": event.total_tickets,
            "available_tickets": event.available_tickets,
            "image_url": event.image_url,
            "is_active": event.is_active,
            "event_status": event.event_status.value if event.event_status else "UPCOMING",
            "organizer_name": event.organizer.username if event.organizer else None
        })
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "events": result
    }


@router.get("/categories/list")
async def get_categories(db: Session = Depends(get_db)):
    """Get all unique event categories"""
    from sqlalchemy import func
    categories = db.query(Event.category).filter(
        Event.is_active == True,
        Event.category.isnot(None)
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]


@router.get("/cities/list")
async def get_cities(db: Session = Depends(get_db)):
    """Get all unique event cities"""
    from sqlalchemy import func
    cities = db.query(Event.city).filter(
        Event.is_active == True,
        Event.city.isnot(None)
    ).distinct().all()
    
    return [city[0] for city in cities if city[0]]

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    result = {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "category": event.category,
        "venue": event.venue,
        "city": event.city,
        "event_date": event.event_date,
        "price": event.price,
        "total_tickets": event.total_tickets,
        "available_tickets": event.available_tickets,
        "image_url": event.image_url,
        "is_active": event.is_active,
        "organizer_id": event.organizer_id,
        "event_status": event.event_status.value if event.event_status else "UPCOMING",
        "organizer_name": event.organizer.username if event.organizer else None
    }
    return result

# Organizer endpoints - require organizer or admin
@router.post("/", response_model=EventResponse)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    event_service = EventService(db)
    event = event_service.create_event(current_user.id, event_data)
    
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "category": event.category,
        "venue": event.venue,
        "city": event.city,
        "event_date": event.event_date,
        "price": event.price,
        "total_tickets": event.total_tickets,
        "available_tickets": event.available_tickets,
        "image_url": event.image_url,
        "is_active": event.is_active,
        "organizer_id": event.organizer_id,
        "event_status": event.event_status.value if event.event_status else "UPCOMING",
        "organizer_name": current_user.username
    }

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_data: EventUpdate,
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    event_service = EventService(db)
    event = event_service.update_event(current_user.id, event_id, event_data)
    
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "category": event.category,
        "venue": event.venue,
        "city": event.city,
        "event_date": event.event_date,
        "price": event.price,
        "total_tickets": event.total_tickets,
        "available_tickets": event.available_tickets,
        "image_url": event.image_url,
        "is_active": event.is_active,
        "organizer_id": event.organizer_id,
        "event_status": event.event_status.value if event.event_status else "UPCOMING",
        "organizer_name": current_user.username
    }

@router.delete("/{event_id}")
async def cancel_event(
    event_id: int,
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    event_service = EventService(db)
    result = event_service.cancel_event(current_user.id, event_id)
    return {"message": "Event cancelled successfully", "affected_bookings": result["affected_bookings"]}

@router.get("/organizer/my-events")
async def get_my_events(
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    """Get only events created by the current organizer"""
    events = db.query(Event).filter(
        Event.organizer_id == current_user.id,
        Event.is_active == True
    ).all()
    
    result = []
    for event in events:
        result.append({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "category": event.category,
            "venue": event.venue,
            "city": event.city,
            "event_date": event.event_date,
            "price": event.price,
            "total_tickets": event.total_tickets,
            "available_tickets": event.available_tickets,
            "image_url": event.image_url,
            "event_status": event.event_status.value if event.event_status else "UPCOMING",
            "organizer_name": current_user.username
        })
    
    return result

@router.get("/organizer/{event_id}/bookings")
async def get_event_bookings(
    event_id: int,
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    event_service = EventService(db)
    bookings = event_service.get_event_bookings(current_user.id, event_id)
    
    result = []
    for booking in bookings:
        result.append({
            "id": booking.id,
            "booking_reference": booking.booking_reference,
            "quantity": booking.quantity,
            "total_price": booking.total_price,
            "status": booking.status,
            "booking_date": booking.booking_date,
            "user": {
                "username": booking.user.username,
                "email": booking.user.email
            } if booking.user else None
        })
    
    return result