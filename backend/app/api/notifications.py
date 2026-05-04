from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.services.notification_service import NotificationService
from app.services.auth_service import AuthService

router = APIRouter()


@router.get("/my-notifications")
async def get_my_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications for logged-in user"""
    notification_service = NotificationService(db)
    notifications = notification_service.get_user_notifications(
        current_user.id, skip, limit, unread_only
    )
    
    result = []
    for notif in notifications:
        result.append({
            "id": notif.id,
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "is_read": notif.is_read,
            "created_at": notif.created_at.isoformat(),
            "booking_reference": notif.booking_reference
        })
    
    return {"notifications": result, "count": len(result)}


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get unread notification count"""
    notification_service = NotificationService(db)
    count = notification_service.get_unread_count(current_user.id)
    return {"unread_count": count}


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    notification_service = NotificationService(db)
    success = notification_service.mark_as_read(notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}


@router.post("/mark-all-read")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    notification_service = NotificationService(db)
    notification_service.mark_all_as_read(current_user.id)
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted"}


@router.post("/{booking_id}/reminder")
async def send_reminder(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send reminder - Only organizer or admin can send"""
    from app.models.booking import Booking
    from app.models.event import Event
    from app.services.booking_service import BookingService
    
    booking_service = BookingService(db)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    event = db.query(Event).filter(Event.id == booking.event_id).first()
    
    if current_user.role != "ADMIN" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only send reminders for your own events")
    
    result = booking_service.send_reminder(booking_id, booking.user_id)
    return result