from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import require_admin
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.booking import Booking
from app.schemas.auth import UserResponse

router = APIRouter()

@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.offset(skip).limit(limit).all()
    return users

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: str,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    user.is_admin = (role == UserRole.ADMIN.value)
    db.commit()
    
    return {"message": f"User role updated to {role}"}

@router.get("/events/all")
async def get_all_events_admin(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if status:
        query = query.filter(Event.event_status == status)
    events = query.offset(skip).limit(limit).all()
    return events

@router.get("/bookings/all")
async def get_all_bookings_admin(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    bookings = query.offset(skip).limit(limit).all()
    return bookings