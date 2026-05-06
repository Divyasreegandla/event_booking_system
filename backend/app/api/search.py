from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database.session import get_db
from app.models.event import Event, EventStatus

router = APIRouter()


@router.get("/advanced")
async def advanced_search(
    search: Optional[str] = Query(None, description="Search by title or description"),
    category: Optional[str] = Query(None, description="Event category"),
    city: Optional[str] = Query(None, description="Event city"),
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    sort_by: Optional[str] = Query("date", description="Sort by: date, popularity, price_low, price_high"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Advanced search with multiple filters and sorting options"""
    query = db.query(Event).filter(Event.is_active == True, Event.event_status == EventStatus.UPCOMING)
    
    if search:
        query = query.filter(
            (Event.title.ilike(f"%{search}%")) | 
            (Event.description.ilike(f"%{search}%"))
        )
    
    if category:
        query = query.filter(Event.category == category)
    
    if city:
        query = query.filter(Event.city.ilike(f"%{city}%"))
    
    if start_date:
        query = query.filter(Event.event_date >= start_date)
    if end_date:
        query = query.filter(Event.event_date <= end_date)
    
    if min_price is not None:
        query = query.filter(Event.price >= min_price)
    if max_price is not None:
        query = query.filter(Event.price <= max_price)
    
    if sort_by == "date":
        query = query.order_by(Event.event_date.asc())
    elif sort_by == "popularity":
        query = query.order_by((Event.total_tickets - Event.available_tickets).desc())
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
            "event_status": event.event_status.value if event.event_status else "UPCOMING",
            "organizer_name": event.organizer.username if event.organizer else None,
            "tickets_sold_percentage": round(((event.total_tickets - event.available_tickets) / event.total_tickets) * 100, 1) if event.total_tickets > 0 else 0
        })
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "events": result
    }


@router.get("/cities")
async def get_cities(db: Session = Depends(get_db)):
    from sqlalchemy import func
    cities = db.query(Event.city).filter(
        Event.is_active == True,
        Event.city.isnot(None)
    ).distinct().all()
    return [city[0] for city in cities if city[0]]


@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    from sqlalchemy import func
    categories = db.query(Event.category).filter(
        Event.is_active == True,
        Event.category.isnot(None)
    ).distinct().all()
    return [cat[0] for cat in categories if cat[0]]