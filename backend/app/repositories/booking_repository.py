from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.repositories.base_repository import BaseRepository
from app.models.booking import Booking, BookingStatus
from app.models.event import Event


class BookingRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, Booking)

    def get_by_user(self, user_id: int, status: str = None) -> List[Booking]:
        query = self.db.query(Booking).filter(Booking.user_id == user_id)
        if status:
            query = query.filter(Booking.status == status)
        return query.order_by(Booking.created_at.desc()).all()

    def get_by_event(self, event_id: int, status: str = None) -> List[Booking]:
        query = self.db.query(Booking).filter(Booking.event_id == event_id)
        if status:
            query = query.filter(Booking.status == status)
        return query.order_by(Booking.created_at.desc()).all()

    def get_by_reference(self, reference: str) -> Optional[Booking]:
        return self.db.query(Booking).filter(Booking.booking_reference == reference).first()

    def get_user_bookings_with_events(self, user_id: int) -> List[Any]:
        results = self.db.query(
            Booking,
            Event
        ).join(Event, Booking.event_id == Event.id).filter(
            Booking.user_id == user_id
        ).order_by(Booking.created_at.desc()).all()
        
        return results

    def get_event_stats(self, event_id: int) -> Dict[str, Any]:
        confirmed_bookings = self.db.query(Booking).filter(
            Booking.event_id == event_id,
            Booking.status == BookingStatus.CONFIRMED
        ).all()
        
        total_tickets_sold = sum(b.quantity for b in confirmed_bookings)
        total_revenue = sum(b.total_price for b in confirmed_bookings)
        
        return {
            "total_bookings": len(confirmed_bookings),
            "total_tickets_sold": total_tickets_sold,
            "total_revenue": float(total_revenue)
        }

    def get_daily_bookings(self, days: int = 30) -> List[Dict[str, Any]]:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        results = self.db.query(
            func.date(Booking.created_at).label('date'),
            func.count(Booking.id).label('count'),
            func.sum(Booking.quantity).label('tickets_sold'),
            func.sum(Booking.total_price).label('revenue')
        ).filter(
            Booking.status == BookingStatus.CONFIRMED,
            Booking.created_at >= start_date
        ).group_by(func.date(Booking.created_at)).order_by(func.date(Booking.created_at)).all()
        
        return [
            {
                "date": str(r.date),
                "count": r.count or 0,
                "tickets_sold": r.tickets_sold or 0,
                "revenue": float(r.revenue or 0)
            }
            for r in results
        ]

    def get_monthly_stats(self, months: int = 12) -> List[Dict[str, Any]]:
        results = self.db.query(
            func.strftime('%Y-%m', Booking.created_at).label('month'),
            func.count(Booking.id).label('total_bookings'),
            func.sum(Booking.quantity).label('tickets_sold'),
            func.sum(Booking.total_price).label('revenue')
        ).filter(
            Booking.status == BookingStatus.CONFIRMED
        ).group_by(func.strftime('%Y-%m', Booking.created_at)).order_by(
            func.strftime('%Y-%m', Booking.created_at).desc()
        ).limit(months).all()
        
        return [
            {
                "month": r.month,
                "total_bookings": r.total_bookings or 0,
                "tickets_sold": r.tickets_sold or 0,
                "revenue": float(r.revenue or 0)
            }
            for r in results
        ]

    def cancel_user_bookings_for_event(self, event_id: int) -> int:
        updated = self.db.query(Booking).filter(
            Booking.event_id == event_id,
            Booking.status == BookingStatus.CONFIRMED
        ).update({"status": BookingStatus.CANCELLED})
        
        self.db.commit()
        return updated