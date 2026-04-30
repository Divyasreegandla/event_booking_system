from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta
from app.models.event import Event, EventStatus
from app.models.booking import Booking
from app.models.user import User, UserRole
from app.schemas.event import EventCreate, EventUpdate

class EventService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_event(self, organizer_id: int, event_data: EventCreate):
        # Check if user is organizer
        user = self.db.query(User).filter(User.id == organizer_id).first()
        if not user or (user.role != UserRole.ORGANIZER and user.role != UserRole.ADMIN):
            raise HTTPException(status_code=403, detail="Only organizers can create events")
        
        # Determine initial event status
        if event_data.event_date < datetime.now():
            event_status = EventStatus.COMPLETED
        else:
            event_status = EventStatus.UPCOMING
        
        db_event = Event(
            title=event_data.title,
            description=event_data.description,
            category=event_data.category,
            venue=event_data.venue,
            city=event_data.city,
            event_date=event_data.event_date,
            price=event_data.price,
            total_tickets=event_data.total_tickets,
            available_tickets=event_data.total_tickets,
            image_url=event_data.image_url,
            organizer_id=organizer_id,  # Critical: This must be set
            event_status=event_status,
            is_active=True
        )
        
        self.db.add(db_event)
        self.db.commit()
        self.db.refresh(db_event)
        
        print(f"Created event ID: {db_event.id} for organizer_id: {organizer_id}")  # Debug
        
        return db_event
    
    def update_event(self, organizer_id: int, event_id: int, event_data: EventUpdate):
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Check ownership
        if event.organizer_id != organizer_id:
            user = self.db.query(User).filter(User.id == organizer_id).first()
            if user.role != UserRole.ADMIN:
                raise HTTPException(status_code=403, detail="You can only update your own events")
        
        update_data = event_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)
        
        # Update event status based on date if changed
        if 'event_date' in update_data and update_data['event_date']:
            if update_data['event_date'] < datetime.now():
                event.event_status = EventStatus.COMPLETED
            elif event.event_status == EventStatus.UPCOMING:
                event.event_status = EventStatus.UPCOMING
        
        self.db.commit()
        self.db.refresh(event)
        return event
    
    def cancel_event(self, organizer_id: int, event_id: int):
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Check ownership
        if event.organizer_id != organizer_id:
            user = self.db.query(User).filter(User.id == organizer_id).first()
            if user.role != UserRole.ADMIN:
                raise HTTPException(status_code=403, detail="You can only cancel your own events")
        
        event.event_status = EventStatus.CANCELLED
        event.is_active = False
        
        self.db.commit()
        
        # Return cancelled bookings for notification
        bookings = self.db.query(Booking).filter(
            Booking.event_id == event_id,
            Booking.status == "confirmed"
        ).all()
        
        return {"event": event, "affected_bookings": len(bookings)}
    
    def get_organizer_events(self, organizer_id: int):
        events = self.db.query(Event).filter(Event.organizer_id == organizer_id).all()
        return events
    
    def get_event_bookings(self, organizer_id: int, event_id: int):
        # Verify ownership
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if event.organizer_id != organizer_id:
            user = self.db.query(User).filter(User.id == organizer_id).first()
            if user.role != UserRole.ADMIN:
                raise HTTPException(status_code=403, detail="You can only view bookings for your own events")
        
        bookings = self.db.query(Booking).filter(Booking.event_id == event_id).all()
        return bookings
    
    def update_event_statuses(self):
        """Automatically update event statuses based on current date"""
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