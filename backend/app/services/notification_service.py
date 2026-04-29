from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.notification import Notification
from app.models.booking import Booking
from app.models.event import Event
from app.models.user import User

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_notification(self, user_id: int, title: str, message: str, type: str):
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification
    
    def create_booking_notification(self, user_id: int, booking_reference: str, event_title: str):
        return self.create_notification(
            user_id=user_id,
            title="Booking Confirmed! 🎉",
            message=f"Your booking {booking_reference} for {event_title} has been confirmed.",
            type="BOOKING"
        )
    
    def create_event_reminder(self, user_id: int, event_title: str, event_date: datetime):
        days_until = (event_date - datetime.now()).days
        return self.create_notification(
            user_id=user_id,
            title="Event Reminder ⏰",
            message=f"Your event '{event_title}' starts in {days_until} days. Don't forget!",
            type="EVENT"
        )
    
    def get_user_notifications(self, user_id: int, unread_only: bool = False):
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(Notification.created_at.desc()).all()
    
    def mark_as_read(self, notification_id: int, user_id: int):
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if notification:
            notification.is_read = True
            self.db.commit()
            return True
        return False
    
    def mark_all_as_read(self, user_id: int):
        self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        self.db.commit()
    
    def get_unread_count(self, user_id: int):
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    def send_event_reminders(self):
        """Background task to send reminders for upcoming events"""
        tomorrow = datetime.now() + timedelta(days=1)
        next_week = datetime.now() + timedelta(days=7)
        
        # Find bookings for events in next 7 days
        bookings = self.db.query(Booking).join(Event).filter(
            Event.event_date.between(tomorrow, next_week),
            Booking.status == "confirmed"
        ).all()
        
        reminders_sent = 0
        for booking in bookings:
            # Check if reminder already sent
            existing = self.db.query(Notification).filter(
                Notification.user_id == booking.user_id,
                Notification.type == "EVENT",
                Notification.title == "Event Reminder ⏰"
            ).first()
            
            if not existing:
                self.create_event_reminder(
                    booking.user_id,
                    booking.event.title,
                    booking.event.event_date
                )
                reminders_sent += 1
        
        return reminders_sent