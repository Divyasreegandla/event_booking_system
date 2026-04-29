from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.booking import Booking
from app.models.event import Event
from app.models.user import User
from app.services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/bookings/all")
async def get_all_bookings(
    skip: int = 0,
    limit: int = 100,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).offset(skip).limit(limit).all()
    return bookings

@router.put("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: int,
    status: str,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if status not in ['pending', 'confirmed', 'cancelled']:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    booking.status = status
    db.commit()
    return {"message": f"Booking status updated to {status}"}

@router.get("/dashboard/stats")
async def get_dashboard_stats(admin=Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_events = db.query(Event).count()
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "confirmed").count()
    total_revenue = db.query(Booking).filter(Booking.status == "confirmed").with_entities(db.func.sum(Booking.total_price)).scalar() or 0
    
    return {
        "total_users": total_users,
        "total_events": total_events,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "total_revenue": total_revenue
    }