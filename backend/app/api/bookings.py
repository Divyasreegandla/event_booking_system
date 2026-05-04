from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.schemas.booking import BookingCreate
from app.services.booking_service import BookingService
from app.services.auth_service import AuthService
from app.dependencies.roles import get_current_user, require_organizer, require_user_or_higher
from app.models.user import User
from app.models.ticket import Ticket
from app.models.booking import Booking
from app.models.event import Event
from app.schemas.booking import BookingCreate, BookingCreateWithCoupon


router = APIRouter()
security = HTTPBearer()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking_service = BookingService(db)
    booking = booking_service.create_booking(
        current_user.id, 
        booking_data.event_id, 
        booking_data.quantity
    )
    return booking

@router.post("/with-coupon", status_code=status.HTTP_201_CREATED)
async def create_booking_with_coupon(
    booking_data: BookingCreateWithCoupon,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking_service = BookingService(db)
    booking = booking_service.create_booking_with_coupon(
        current_user.id, 
        booking_data.event_id, 
        booking_data.quantity,
        booking_data.coupon_code
    )
    return booking

@router.get("/my-bookings")
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking_service = BookingService(db)
    bookings = booking_service.get_user_bookings(current_user.id)
    return bookings

@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking_service = BookingService(db)
    booking_service.cancel_booking(booking_id, current_user.id)
    return {"message": "Booking cancelled successfully"}

@router.get("/my-tickets")
async def get_my_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tickets for logged-in user (including cancelled)"""
    tickets = db.query(Ticket).join(Booking).filter(
        Booking.user_id == current_user.id
    ).all()
    
    result = []
    for ticket in tickets:
        booking = db.query(Booking).filter(Booking.id == ticket.booking_id).first()
        event = db.query(Event).filter(Event.id == booking.event_id).first()
        result.append({
            "id": ticket.id,
            "ticket_code": ticket.ticket_code,
            "qr_code": ticket.qr_code if booking.status == "confirmed" else None,
            "is_used": ticket.is_used,
            "is_cancelled": booking.status == "cancelled",
            "booking_status": booking.status,
            "event_title": event.title,
            "event_date": event.event_date,
            "venue": event.venue,
            "booking_reference": booking.booking_reference,
            "quantity": booking.quantity,
            "total_price": booking.total_price
        })
    
    return {"tickets": result}

@router.get("/ticket/{ticket_code}")
async def get_ticket_details(
    ticket_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific ticket details"""
    ticket = db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first()
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    
    booking = db.query(Booking).filter(Booking.id == ticket.booking_id).first()
    if booking.user_id != current_user.id:
        raise HTTPException(403, "Not your ticket")
    
    event = db.query(Event).filter(Event.id == booking.event_id).first()
    
    return {
        "ticket_code": ticket.ticket_code,
        "qr_code": ticket.qr_code,
        "is_used": ticket.is_used,
        "event": {
            "title": event.title,
            "date": event.event_date,
            "venue": event.venue,
            "city": event.city
        },
        "booking_reference": booking.booking_reference,
        "quantity": booking.quantity
    }
@router.post("/verify-ticket/{ticket_code}")
async def verify_ticket_entry(
    ticket_code: str,
    current_user: User = Depends(require_organizer),  # Change this line
    db: Session = Depends(get_db)
):
    """Verify ticket at entry (Organizer/Admin only)"""
    ticket = db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first()
    if not ticket:
        return {"valid": False, "message": "Invalid ticket code"}
    
    booking = db.query(Booking).filter(Booking.id == ticket.booking_id).first()
    if booking.status != "confirmed":
        return {"valid": False, "message": f"Booking is {booking.status}"}
    
    event = db.query(Event).filter(Event.id == booking.event_id).first()
    
    # Verify that the organizer/admin is allowed to verify this event
    if current_user.role != "ADMIN" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only verify tickets for your own events")
    
    if event.event_date < datetime.now():
        return {"valid": False, "message": "Event has passed"}
    
    if ticket.is_used:
        return {"valid": False, "message": "Ticket already used"}
    
    ticket.is_used = True
    ticket.used_at = datetime.now()
    db.commit()
    
    return {
        "valid": True, 
        "message": "Welcome to the event!",
        "event_title": event.title,
        "verified_by": current_user.username,
        "user_name": booking.user.username if hasattr(booking.user, 'username') else "Guest"
    }