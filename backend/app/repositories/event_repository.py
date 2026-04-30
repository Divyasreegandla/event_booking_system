from typing import Optional, List, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.repositories.base_repository import BaseRepository
from app.models.event import Event, EventStatus


class EventRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, Event)

    def get_by_organizer(self, organizer_id: int, skip: int = 0, limit: int = 100) -> List[Event]:
        return self.db.query(Event).filter(
            Event.organizer_id == organizer_id
        ).offset(skip).limit(limit).all()

    def get_by_status(self, status: EventStatus, skip: int = 0, limit: int = 100) -> List[Event]:
        return self.db.query(Event).filter(
            Event.event_status == status
        ).offset(skip).limit(limit).all()

    def get_upcoming_events(self, skip: int = 0, limit: int = 100) -> List[Event]:
        return self.db.query(Event).filter(
            Event.event_status == EventStatus.UPCOMING,
            Event.event_date > datetime.now()
        ).order_by(Event.event_date).offset(skip).limit(limit).all()

    def get_active_events(self, skip: int = 0, limit: int = 100) -> List[Event]:
        return self.db.query(Event).filter(
            Event.event_status.in_([EventStatus.UPCOMING, EventStatus.ONGOING]),
            Event.is_active == True
        ).order_by(Event.event_date).offset(skip).limit(limit).all()

    def search_events(self, search_term: str, category: str = None, city: str = None) -> List[Event]:
        query = self.db.query(Event).filter(
            or_(
                Event.title.contains(search_term),
                Event.description.contains(search_term)
            )
        )
        if category:
            query = query.filter(Event.category == category)
        if city:
            query = query.filter(Event.city == city)
        return query.all()

    def update_status_automatically(self) -> None:
        now = datetime.now()
        
        # Update UPCOMING to ONGOING
        self.db.query(Event).filter(
            Event.event_status == EventStatus.UPCOMING,
            Event.event_date <= now,
            Event.event_date > now - timedelta(hours=24)
        ).update({"event_status": EventStatus.ONGOING})
        
        # Update ONGOING to COMPLETED
        self.db.query(Event).filter(
            Event.event_status == EventStatus.ONGOING,
            Event.event_date < now - timedelta(hours=24)
        ).update({"event_status": EventStatus.COMPLETED})
        
        self.db.commit()

    def get_event_with_details(self, event_id: int) -> Optional[dict]:
        event = self.get_by_id(event_id)
        if event:
            from app.models.booking import Booking
            
            bookings = self.db.query(Booking).filter(Booking.event_id == event_id).all()
            
            return {
                "event": event,
                "organizer_name": event.organizer.username if event.organizer else None,
                "total_bookings": len(bookings),
                "total_tickets_sold": sum(b.quantity for b in bookings if b.status == "confirmed"),
                "total_revenue": sum(b.total_price for b in bookings if b.status == "confirmed")
            }
        return None

    def get_categories_with_counts(self) -> dict:
        results = self.db.query(
            Event.category,
            func.count(Event.id).label('count')
        ).filter(Event.category.isnot(None)).group_by(Event.category).all()
        
        return {r.category: r.count for r in results}

    def get_events_by_city(self) -> dict:
        results = self.db.query(
            Event.city,
            func.count(Event.id).label('count')
        ).filter(Event.city.isnot(None)).group_by(Event.city).all()
        
        return {r.city: r.count for r in results}