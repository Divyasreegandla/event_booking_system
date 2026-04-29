from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.auth_service import AuthService
from app.models.notification import Notification
from app.services.booking_service import BookingService


router = APIRouter()
security = HTTPBearer()

@router.get("/my-notifications")
async def get_my_notifications(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get notifications for logged-in user"""
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
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
    
    return {"notifications": result}

@router.get("/unread-count")
async def get_unread_count(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get unread notification count"""
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {"unread_count": count}

@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.post("/mark-all-read")
async def mark_all_read(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": "All notifications marked as read"}

@router.post("/{booking_id}/reminder")
async def send_reminder(
    booking_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    booking_service = BookingService(db)
    result = booking_service.send_reminder(booking_id, current_user.id)
    return result
