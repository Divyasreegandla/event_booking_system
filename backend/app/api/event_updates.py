from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user, require_organizer
from app.models.user import User
from app.models.event import Event
from app.models.event_update import EventUpdate
from app.schemas.event_update import EventUpdateCreate, EventUpdateResponse
from app.services.websocket_manager import manager
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get("/event/{event_id}", response_model=list[EventUpdateResponse])
async def get_event_updates(
    event_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all updates for an event"""
    updates = db.query(EventUpdate).filter(
        EventUpdate.event_id == event_id
    ).order_by(EventUpdate.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add creator names
    result = []
    for update in updates:
        creator = db.query(User).filter(User.id == update.created_by).first()
        result.append({
            "id": update.id,
            "event_id": update.event_id,
            "message": update.message,
            "update_type": update.update_type,
            "created_by": update.created_by,
            "created_by_name": creator.username if creator else None,
            "created_at": update.created_at
        })
    
    return result


@router.post("/event/{event_id}", response_model=EventUpdateResponse)
async def create_event_update(
    event_id: int,
    update_data: EventUpdateCreate,
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    """Create an update for an event (Organizer/Admin only)"""
    # Check if event exists and user owns it
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if current_user.role != "ADMIN" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own events")
    
    # Create update
    event_update = EventUpdate(
        event_id=event_id,
        message=update_data.message,
        update_type=update_data.update_type,
        created_by=current_user.id
    )
    
    db.add(event_update)
    db.commit()
    db.refresh(event_update)
    
    # Send real-time notification to users who have this event in wishlist or bookings
    from app.models.booking import Booking, BookingStatus
    from app.models.wishlist import Wishlist
    
    # Get users to notify
    booked_users = db.query(Booking.user_id).filter(
        Booking.event_id == event_id,
        Booking.status == BookingStatus.CONFIRMED
    ).distinct().all()
    
    wishlist_users = db.query(Wishlist.user_id).filter(
        Wishlist.event_id == event_id
    ).distinct().all()
    
    all_users = set([u[0] for u in booked_users] + [u[0] for u in wishlist_users])
    
    # Create notifications
    notification_service = NotificationService(db)
    for user_id in all_users:
        notification_service.create_notification(
            user_id=user_id,
            title=f"📢 Event Update: {event.title}",
            message=f"{update_data.update_type.upper()}: {update_data.message[:150]}",
            type="EVENT",
            event_id=event_id
        )
    
    # Send WebSocket broadcast for users currently viewing the event
    await manager.broadcast_event_update(event_id, {
        "type": "event_update",
        "event_id": event_id,
        "update": {
            "id": event_update.id,
            "message": update_data.message,
            "update_type": update_data.update_type,
            "created_by_name": current_user.username,
            "created_at": event_update.created_at.isoformat()
        }
    })
    
    creator = db.query(User).filter(User.id == event_update.created_by).first()
    
    return {
        "id": event_update.id,
        "event_id": event_update.event_id,
        "message": event_update.message,
        "update_type": event_update.update_type,
        "created_by": event_update.created_by,
        "created_by_name": creator.username if creator else None,
        "created_at": event_update.created_at
    }


@router.delete("/{update_id}")
async def delete_event_update(
    update_id: int,
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    """Delete an event update (Organizer/Admin only)"""
    event_update = db.query(EventUpdate).filter(EventUpdate.id == update_id).first()
    if not event_update:
        raise HTTPException(status_code=404, detail="Update not found")
    
    event = db.query(Event).filter(Event.id == event_update.event_id).first()
    if current_user.role != "ADMIN" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete updates for your own events")
    
    db.delete(event_update)
    db.commit()
    
    return {"message": "Update deleted successfully"}