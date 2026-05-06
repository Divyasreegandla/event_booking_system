from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.dependencies.roles import get_current_user
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.event import Event
from app.schemas.auth import UserResponse
import base64

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile"""
    return current_user


@router.put("/profile")
async def update_profile(
    username: str = None,
    email: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    if username:
        existing = db.query(User).filter(
            User.username == username,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = username
    
    if email:
        existing = db.query(User).filter(
            User.email == email,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = email
    
    db.commit()
    db.refresh(current_user)
    
    # Return the full user object with profile_picture and created_at
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "role": current_user.role.value if current_user.role else "USER",
        "is_admin": current_user.is_admin,
        "profile_picture": current_user.profile_picture,
        "created_at": current_user.created_at
    }


@router.post("/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile picture (stored as base64 in database)"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    base64_image = base64.b64encode(contents).decode('utf-8')
    current_user.profile_picture = f"data:{file.content_type};base64,{base64_image}"
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile picture uploaded successfully", 
        "profile_picture": current_user.profile_picture,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "role": current_user.role.value if current_user.role else "USER",
            "is_admin": current_user.is_admin,
            "profile_picture": current_user.profile_picture,
            "created_at": current_user.created_at
        }
    }


@router.delete("/profile-picture")
async def delete_profile_picture(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete profile picture"""
    current_user.profile_picture = None
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Profile picture deleted",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "role": current_user.role.value if current_user.role else "USER",
            "is_admin": current_user.is_admin,
            "profile_picture": current_user.profile_picture,
            "created_at": current_user.created_at
        }
    }


@router.get("/booking-summary")
async def get_booking_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user booking summary"""
    from datetime import datetime
    
    # Total confirmed bookings
    total_bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id,
        Booking.status == BookingStatus.CONFIRMED
    ).count()
    
    # Total tickets purchased
    total_tickets_result = db.query(func.sum(Booking.quantity)).filter(
        Booking.user_id == current_user.id,
        Booking.status == BookingStatus.CONFIRMED
    ).first()
    total_tickets_purchased = total_tickets_result[0] or 0
    
    # Total spent
    total_spent_result = db.query(func.sum(Booking.final_amount)).filter(
        Booking.user_id == current_user.id,
        Booking.status == BookingStatus.CONFIRMED
    ).first()
    total_amount_spent = total_spent_result[0] or 0
    
    # Upcoming events
    upcoming_bookings = db.query(Booking).join(Event).filter(
        Booking.user_id == current_user.id,
        Booking.status == BookingStatus.CONFIRMED,
        Event.event_date > datetime.now()
    ).count()
    
    # Completed events
    completed_bookings = db.query(Booking).join(Event).filter(
        Booking.user_id == current_user.id,
        Booking.status == BookingStatus.CONFIRMED,
        Event.event_date < datetime.now()
    ).count()
    
    return {
        "total_bookings": total_bookings,
        "total_tickets_purchased": total_tickets_purchased,
        "total_amount_spent": float(total_amount_spent),
        "upcoming_events": upcoming_bookings,
        "completed_events": completed_bookings
    }