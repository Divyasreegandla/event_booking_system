from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.user_activity import UserActivity
from app.models.event import Event, EventStatus
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from datetime import datetime, timedelta

class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
    
    def track_user_activity(self, user_id: int, event_id: int, activity_type: str):
        """Track user activity for recommendations"""
        activity = UserActivity(
            user_id=user_id,
            event_id=event_id,
            activity_type=activity_type
        )
        self.db.add(activity)
        self.db.commit()
    
    def get_user_preferences(self, user_id: int) -> dict:
        """Analyze user preferences based on activity"""
        # Get preferred categories from bookings and views
        booked_categories = self.db.query(Event.category).join(
            Booking, Booking.event_id == Event.id
        ).filter(
            Booking.user_id == user_id,
            Booking.status == BookingStatus.CONFIRMED
        ).distinct().all()
        
        viewed_categories = self.db.query(Event.category).join(
            UserActivity, UserActivity.event_id == Event.id
        ).filter(
            UserActivity.user_id == user_id,
            UserActivity.activity_type == 'view'
        ).distinct().limit(5).all()
        
        preferences = {
            "categories": [c[0] for c in (booked_categories + viewed_categories) if c[0]],
            "preferred_city": None
        }
        
        # Get most booked city
        city_stats = self.db.query(
            Event.city,
            func.count(Booking.id).label('count')
        ).join(Booking, Booking.event_id == Event.id).filter(
            Booking.user_id == user_id,
            Booking.status == BookingStatus.CONFIRMED
        ).group_by(Event.city).order_by(func.count(Booking.id).desc()).first()
        
        if city_stats:
            preferences["preferred_city"] = city_stats[0]
        
        return preferences
    
    def get_personalized_recommendations(self, user_id: int, limit: int = 6) -> list:
        """Get personalized event recommendations"""
        preferences = self.get_user_preferences(user_id)
        
        query = self.db.query(Event).filter(
            Event.is_active == True,
            Event.event_status == EventStatus.UPCOMING,
            Event.event_date > datetime.now()
        )
        
        # Exclude events the user has already booked
        booked_event_ids = self.db.query(Booking.event_id).filter(
            Booking.user_id == user_id,
            Booking.status == BookingStatus.CONFIRMED
        ).subquery()
        
        query = query.filter(Event.id.notin_(booked_event_ids))
        
        # Prioritize by category preference
        if preferences.get("categories"):
            category_list = list(dict.fromkeys(preferences["categories"]))[:3]
            query = query.order_by(
                Event.category.in_(category_list).desc(),
                Event.event_date.asc()
            )
        else:
            # Default to popular events
            query = query.order_by(
                (Event.total_tickets - Event.available_tickets).desc(),
                Event.event_date.asc()
            )
        
        events = query.limit(limit).all()
        
        return [self._format_event(e) for e in events]
    
    def get_trending_events(self, limit: int = 6) -> list:
        """Get trending events based on recent views and bookings"""
        seven_days_ago = datetime.now() - timedelta(days=7)
        
        trending = self.db.query(
            Event,
            (func.count(Booking.id) + func.count(UserActivity.id)).label('popularity')
        ).outerjoin(
            Booking, and_(
                Booking.event_id == Event.id,
                Booking.created_at >= seven_days_ago,
                Booking.status == BookingStatus.CONFIRMED
            )
        ).outerjoin(
            UserActivity, and_(
                UserActivity.event_id == Event.id,
                UserActivity.created_at >= seven_days_ago
            )
        ).filter(
            Event.is_active == True,
            Event.event_status == EventStatus.UPCOMING,
            Event.event_date > datetime.now()
        ).group_by(Event.id).order_by(
            func.count(Booking.id).desc()
        ).limit(limit).all()
        
        return [self._format_event(e[0]) for e in trending]
    
    def get_similar_events(self, event_id: int, limit: int = 4) -> list:
        """Get events similar to a given event"""
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return []
        
        similar = self.db.query(Event).filter(
            Event.is_active == True,
            Event.event_status == EventStatus.UPCOMING,
            Event.id != event_id,
            Event.category == event.category
        ).order_by(
            Event.event_date.asc()
        ).limit(limit).all()
        
        return [self._format_event(e) for e in similar]
    
    def _format_event(self, event) -> dict:
        return {
            "id": event.id,
            "title": event.title,
            "category": event.category,
            "city": event.city,
            "event_date": event.event_date,
            "price": event.price,
            "image_url": event.image_url,
            "available_tickets": event.available_tickets
        }