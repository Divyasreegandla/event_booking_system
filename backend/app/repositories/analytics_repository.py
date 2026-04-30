from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.user import User, UserRole
from app.models.event import Event, EventStatus
from app.models.booking import Booking, BookingStatus


class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_platform_overview(self) -> Dict[str, Any]:
        total_users = self.db.query(User).count()
        total_organizers = self.db.query(User).filter(User.role == UserRole.ORGANIZER).count()
        total_admins = self.db.query(User).filter(User.role == UserRole.ADMIN).count()
        
        total_events = self.db.query(Event).count()
        active_events = self.db.query(Event).filter(Event.event_status == EventStatus.UPCOMING).count()
        completed_events = self.db.query(Event).filter(Event.event_status == EventStatus.COMPLETED).count()
        cancelled_events = self.db.query(Event).filter(Event.event_status == EventStatus.CANCELLED).count()
        
        confirmed_bookings = self.db.query(Booking).filter(Booking.status == BookingStatus.CONFIRMED)
        total_bookings = confirmed_bookings.count()
        total_tickets_sold = confirmed_bookings.with_entities(func.sum(Booking.quantity)).scalar() or 0
        total_revenue = confirmed_bookings.with_entities(func.sum(Booking.total_price)).scalar() or 0
        
        return {
            "users": {
                "total": total_users,
                "organizers": total_organizers,
                "admins": total_admins
            },
            "events": {
                "total": total_events,
                "active": active_events,
                "completed": completed_events,
                "cancelled": cancelled_events
            },
            "bookings": {
                "total": total_bookings,
                "tickets_sold": total_tickets_sold,
                "revenue": float(total_revenue)
            }
        }

    def get_revenue_trends(self, months: int = 12) -> List[Dict[str, Any]]:
        results = self.db.query(
            func.strftime('%Y-%m', Booking.created_at).label('month'),
            func.sum(Booking.total_price).label('revenue'),
            func.count(Booking.id).label('bookings'),
            func.sum(Booking.quantity).label('tickets')
        ).filter(
            Booking.status == BookingStatus.CONFIRMED,
            Booking.created_at >= datetime.now() - timedelta(days=months*30)
        ).group_by(func.strftime('%Y-%m', Booking.created_at)).order_by(
            func.strftime('%Y-%m', Booking.created_at)
        ).all()
        
        return [
            {
                "month": r.month,
                "revenue": float(r.revenue or 0),
                "bookings": r.bookings or 0,
                "tickets": r.tickets or 0
            }
            for r in results
        ]

    def get_top_events(self, limit: int = 10, by: str = "revenue") -> List[Dict[str, Any]]:
        if by == "revenue":
            order_by = func.sum(Booking.total_price).desc()
        else:
            order_by = func.sum(Booking.quantity).desc()
        
        results = self.db.query(
            Event.id,
            Event.title,
            Event.category,
            Event.event_status,
            func.sum(Booking.quantity).label('tickets_sold'),
            func.sum(Booking.total_price).label('revenue'),
            func.count(Booking.id).label('booking_count')
        ).join(Booking, Booking.event_id == Event.id).filter(
            Booking.status == BookingStatus.CONFIRMED
        ).group_by(Event.id).order_by(order_by).limit(limit).all()
        
        return [
            {
                "id": r.id,
                "title": r.title,
                "category": r.category,
                "status": r.event_status.value if r.event_status else None,
                "tickets_sold": r.tickets_sold or 0,
                "revenue": float(r.revenue or 0),
                "booking_count": r.booking_count or 0
            }
            for r in results
        ]

    def get_organizer_performance(self, organizer_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.db.query(
            User.id,
            User.username,
            User.email,
            func.count(Event.id).label('total_events'),
            func.sum(Booking.quantity).label('total_tickets_sold'),
            func.sum(Booking.total_price).label('total_revenue')
        ).outerjoin(Event, Event.organizer_id == User.id)\
         .outerjoin(Booking, and_(Booking.event_id == Event.id, Booking.status == BookingStatus.CONFIRMED))\
         .filter(User.role == UserRole.ORGANIZER)
        
        if organizer_id:
            query = query.filter(User.id == organizer_id)
        
        results = query.group_by(User.id).all()
        
        return [
            {
                "organizer_id": r.id,
                "username": r.username,
                "email": r.email,
                "total_events": r.total_events or 0,
                "total_tickets_sold": r.total_tickets_sold or 0,
                "total_revenue": float(r.total_revenue or 0)
            }
            for r in results
        ]

    def get_dashboard_summary(self) -> Dict[str, Any]:
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        new_users_week = self.db.query(User).filter(
            func.date(User.created_at) >= week_ago
        ).count()
        
        new_events_week = self.db.query(Event).filter(
            func.date(Event.created_at) >= week_ago
        ).count()
        
        bookings_week = self.db.query(Booking).filter(
            Booking.status == BookingStatus.CONFIRMED,
            func.date(Booking.created_at) >= week_ago
        ).count()
        
        revenue_week = self.db.query(func.sum(Booking.total_price)).filter(
            Booking.status == BookingStatus.CONFIRMED,
            func.date(Booking.created_at) >= week_ago
        ).scalar() or 0
        
        return {
            "new_users_last_7_days": new_users_week,
            "new_events_last_7_days": new_events_week,
            "bookings_last_7_days": bookings_week,
            "revenue_last_7_days": float(revenue_week),
            "total_events_upcoming": self.db.query(Event).filter(Event.event_status == EventStatus.UPCOMING).count(),
            "total_events_ongoing": self.db.query(Event).filter(Event.event_status == EventStatus.ONGOING).count()
        }