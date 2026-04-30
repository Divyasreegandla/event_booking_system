from typing import Optional, List, Any
from datetime import datetime
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.ticket import Ticket
from app.models.booking import Booking


class TicketRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, Ticket)

    def get_by_code(self, ticket_code: str) -> Optional[Ticket]:
        return self.db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first()

    def get_by_booking(self, booking_id: int) -> List[Ticket]:
        return self.db.query(Ticket).filter(Ticket.booking_id == booking_id).all()

    def mark_as_used(self, ticket_id: int) -> Optional[Ticket]:
        return self.update(ticket_id, is_used=True, used_at=datetime.now())

    def get_unused_tickets_by_booking(self, booking_id: int) -> List[Ticket]:
        return self.db.query(Ticket).filter(
            Ticket.booking_id == booking_id,
            Ticket.is_used == False
        ).all()

    def get_used_tickets_count_by_event(self, event_id: int) -> int:
        count = self.db.query(Ticket).join(Booking).filter(
            Booking.event_id == event_id,
            Ticket.is_used == True
        ).count()
        
        return count

    def get_tickets_by_event(self, event_id: int) -> List[Any]:
        tickets = self.db.query(Ticket).join(Booking).filter(
            Booking.event_id == event_id
        ).all()
        
        return tickets