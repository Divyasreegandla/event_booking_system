from app.models.notification import Notification, NotificationType
from app.models.booking import Booking, BookingStatus
from app.models.event import Event
from sqlalchemy.orm import Session
from datetime import datetime, timedelta


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_notification(self, user_id: int, title: str, message: str, 
                           type: str, booking_reference: str = None, event_id: int = None):
        """Create a notification for a user"""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            booking_reference=booking_reference,
            event_id=event_id
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification
    
    def create_booking_notification(self, user_id: int, booking_reference: str, event_title: str, status: str):
        """Create booking confirmation/cancellation notification"""
        if status == "confirmed":
            title = "🎉 Booking Confirmed!"
            message = f"Your booking {booking_reference} for {event_title} has been confirmed."
        elif status == "cancelled":
            title = "❌ Booking Cancelled"
            message = f"Your booking {booking_reference} for {event_title} has been cancelled."
        else:
            title = "📝 Booking Update"
            message = f"Your booking {booking_reference} for {event_title} has been updated."
        
        return self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            type="BOOKING",
            booking_reference=booking_reference
        )
    
    def create_payment_notification(self, user_id: int, booking_reference: str, amount: float, status: str):
        """Create payment status notification"""
        if status == "success":
            title = "✅ Payment Successful"
            message = f"Payment of ₹{amount} for booking {booking_reference} was successful."
        elif status == "failed":
            title = "❌ Payment Failed"
            message = f"Payment of ₹{amount} for booking {booking_reference} failed. Please try again."
        else:
            title = "💰 Payment Update"
            message = f"Payment for booking {booking_reference} is being processed."
        
        return self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            type="PAYMENT",
            booking_reference=booking_reference
        )
    
    def create_event_reminder(self, user_id: int, event_title: str, event_date: datetime, booking_reference: str):
        """Create event reminder notification"""
        days_until = (event_date - datetime.now()).days
        if days_until == 0:
            day_text = "today"
        elif days_until == 1:
            day_text = "tomorrow"
        else:
            day_text = f"in {days_until} days"
        
        title = "🔔 Event Reminder"
        message = f"Your event '{event_title}' starts {day_text}. Don't forget to bring your tickets!"
        
        return self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            type="EVENT",
            booking_reference=booking_reference
        )
    
    def create_event_update_notification(self, user_id: int, event_title: str, update_message: str, event_id: int):
        """Create notification for event updates (cancellation, reschedule)"""
        title = "📢 Event Update"
        message = f"Update for '{event_title}': {update_message}"
        
        return self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            type="EVENT",
            event_id=event_id
        )
    
    def create_system_notification(self, user_id: int, title: str, message: str):
        """Create system notification"""
        return self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            type="SYSTEM"
        )
    
    def get_user_notifications(self, user_id: int, skip: int = 0, limit: int = 50, unread_only: bool = False):
        """Get user's notifications"""
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    def mark_as_read(self, notification_id: int, user_id: int):
        """Mark a specific notification as read"""
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
        """Mark all user's notifications as read"""
        self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        self.db.commit()
    
    def get_unread_count(self, user_id: int):
        """Get count of unread notifications"""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    def send_upcoming_event_reminders(self):
        """Background task to send reminders for upcoming events"""
        tomorrow = datetime.now() + timedelta(days=1)
        next_week = datetime.now() + timedelta(days=7)
        
        # Get confirmed bookings for events in next 7 days
        bookings = self.db.query(Booking).join(Event).filter(
            Event.event_date.between(tomorrow, next_week),
            Booking.status == BookingStatus.CONFIRMED
        ).all()
        
        reminders_sent = 0
        for booking in bookings:
            # Check if reminder already sent (last 24 hours)
            existing = self.db.query(Notification).filter(
                Notification.user_id == booking.user_id,
                Notification.booking_reference == booking.booking_reference,
                Notification.type == "EVENT",
                Notification.created_at > datetime.now() - timedelta(hours=24)
            ).first()
            
            if not existing:
                self.create_event_reminder(
                    booking.user_id,
                    booking.event.title,
                    booking.event.event_date,
                    booking.booking_reference
                )
                reminders_sent += 1
        
        return reminders_sent
    
    def send_event_cancellation_notifications(self, event_id: int, event_title: str, cancellations_reason: str = "event cancelled"):
        """Send notifications to all users with confirmed bookings for cancelled event"""
        bookings = self.db.query(Booking).filter(
            Booking.event_id == event_id,
            Booking.status == BookingStatus.CONFIRMED
        ).all()
        
        notifications_sent = 0
        for booking in bookings:
            self.create_event_update_notification(
                booking.user_id,
                event_title,
                f"The event has been {cancellations_reason}. Your booking {booking.booking_reference} has been cancelled and refund will be processed.",
                event_id
            )
            notifications_sent += 1
        
        return notifications_sent