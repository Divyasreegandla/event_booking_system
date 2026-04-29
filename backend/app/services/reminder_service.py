import threading
import time
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.booking import Booking
from app.models.event import Event
from app.models.notification import Notification

def create_event_reminders():
    """Create reminder notifications for upcoming events"""
    try:
        db = SessionLocal()
        now = datetime.now()
        
        # Check for events in next 3 days (1, 2, 3 days from now)
        for days in [1, 2, 3]:
            target_date = now + timedelta(days=days)
            next_day = target_date + timedelta(days=1)
            
            # Find bookings for events happening exactly on target_date
            bookings = db.query(Booking).join(Event).filter(
                Event.event_date >= target_date,
                Event.event_date < next_day,
                Booking.status == "confirmed"
            ).all()
            
            for booking in bookings:
                event = db.query(Event).filter(Event.id == booking.event_id).first()
                
                # Check if reminder already sent for this booking
                existing = db.query(Notification).filter(
                    Notification.user_id == booking.user_id,
                    Notification.booking_reference == booking.booking_reference,
                    Notification.type == "EVENT_REMINDER"
                ).first()
                
                if not existing and event:
                    if days == 1:
                        day_text = "tomorrow"
                    else:
                        day_text = f"in {days} days"
                    
                    reminder = Notification(
                        user_id=booking.user_id,
                        title=f"🔔 Event Reminder: {event.title}",
                        message=f"Your event '{event.title}' starts {day_text} on {event.event_date.strftime('%B %d, %Y at %I:%M %p')} at {event.venue}",
                        type="EVENT_REMINDER",
                        booking_reference=booking.booking_reference,
                        event_id=event.id
                    )
                    db.add(reminder)
                    db.commit()
                    print(f"✅ Reminder created for user {booking.user_id}: {event.title} - {day_text}")
        
        db.close()
    except Exception as e:
        print(f"❌ Reminder service error: {e}")

def reminder_scheduler():
    """Run reminder checks every hour"""
    while True:
        create_event_reminders()
        time.sleep(3600)  # Check every hour

# Start the background thread
reminder_thread = threading.Thread(target=reminder_scheduler, daemon=True)
reminder_thread.start()
print("🚀 Event reminder service started!")