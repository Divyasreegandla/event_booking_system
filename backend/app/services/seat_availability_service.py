from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.event import Event
from app.models.booking import Booking, BookingStatus
from app.services.websocket_manager import manager
import asyncio
from threading import Lock

class SeatAvailabilityService:
    def __init__(self, db: Session):
        self.db = db
        self._locks = {}
    
    def _get_lock(self, event_id: int):
        if event_id not in self._locks:
            self._locks[event_id] = Lock()
        return self._locks[event_id]
    
    def check_availability(self, event_id: int, requested_quantity: int) -> bool:
        """Check if requested tickets are available"""
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return False
        return event.available_tickets >= requested_quantity
    
    def reserve_tickets(self, event_id: int, quantity: int) -> bool:
        """Reserve tickets atomically"""
        with self._get_lock(event_id):
            event = self.db.query(Event).filter(Event.id == event_id).first()
            if not event:
                return False
            
            if event.available_tickets >= quantity:
                event.available_tickets -= quantity
                self.db.commit()
                
                # Broadcast availability update
                asyncio.create_task(
                    manager.broadcast_event_update(event_id, {
                        "type": "availability_update",
                        "event_id": event_id,
                        "available_tickets": event.available_tickets,
                        "total_tickets": event.total_tickets
                    })
                )
                return True
            return False
    
    def release_tickets(self, event_id: int, quantity: int):
        """Release reserved tickets (for cancellations)"""
        with self._get_lock(event_id):
            event = self.db.query(Event).filter(Event.id == event_id).first()
            if event:
                event.available_tickets += quantity
                self.db.commit()
                
                asyncio.create_task(
                    manager.broadcast_event_update(event_id, {
                        "type": "availability_update",
                        "event_id": event_id,
                        "available_tickets": event.available_tickets,
                        "total_tickets": event.total_tickets
                    })
                )
    
    def get_event_availability(self, event_id: int) -> dict:
        """Get current availability for an event"""
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return {"available": 0, "total": 0, "percentage": 0}
        
        percentage = (event.available_tickets / event.total_tickets) * 100 if event.total_tickets > 0 else 0
        
        return {
            "available": event.available_tickets,
            "total": event.total_tickets,
            "percentage": round(percentage, 1),
            "status": "available" if event.available_tickets > 0 else "sold_out",
            "is_low": event.available_tickets < event.total_tickets * 0.2 if event.total_tickets > 0 else False
        }