"""
Run this script to create a past event for testing reviews:
python create_past_event.py
"""

from app.database.session import SessionLocal
from app.models.event import Event, EventStatus
from app.models.user import User, UserRole
from datetime import datetime, timedelta

def create_past_event():
    db = SessionLocal()
    
    # Get or create organizer
    organizer = db.query(User).filter(User.role == UserRole.ORGANIZER).first()
    
    if not organizer:
        print("No organizer found. Please run add_events.py first")
        db.close()
        return None
    
    # Create past event (30 days ago)
    past_event = Event(
        title="🎪 PAST EVENT - Review Test Concert",
        description="""
        This is a special test event that already happened on April 4, 2026.
        You can book tickets for this event (even though it's in the past) 
        specifically for testing the review functionality.
        
        Featured Artists:
        • Special Guest Performers
        • Amazing Light Show
        • Live Band Experience
        
        Note: This event is for review testing only.
        """,
        category="Music",
        venue="Test Arena - Review Center",
        city="Mumbai",
        event_date=datetime.now() - timedelta(days=30),  # 30 days ago
        price=499,
        total_tickets=50,
        available_tickets=50,
        image_url="https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg",
        organizer_id=organizer.id,
        event_status=EventStatus.COMPLETED,  # Mark as completed
        is_active=True
    )
    
    db.add(past_event)
    db.commit()
    db.refresh(past_event)
    
    print("=" * 60)
    print("✅ PAST EVENT CREATED SUCCESSFULLY!")
    print("=" * 60)
    print(f"   Event ID: {past_event.id}")
    print(f"   Title: {past_event.title}")
    print(f"   Date: {past_event.event_date}")
    print(f"   Status: {past_event.event_status.value}")
    print("=" * 60)
    
    db.close()
    return past_event.id

if __name__ == "__main__":
    event_id = create_past_event()
    if event_id:
        print(f"\n📝 Use this Event ID for testing reviews: {event_id}")
        print("\nNext steps:")
        print(f"1. Login as user@smartevent.com")
        print(f"2. Book event ID: {event_id}")
        print(f"3. Complete payment")
        print(f"4. Submit review at POST /api/reviews/{event_id}")