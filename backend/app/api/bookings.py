from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.schemas.booking import BookingCreate, TicketVerificationResponse, BookingStatusUpdate
from app.services.booking_service import BookingService
from app.services.auth_service import AuthService
from app.models.ticket import Ticket
from app.models.booking import Booking
from app.models.event import Event

router = APIRouter()
security = HTTPBearer()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    booking_service = BookingService(db)
    booking = booking_service.create_booking(
        current_user.id, 
        booking_data.event_id, 
        booking_data.quantity
    )
    return booking

@router.get("/my-bookings")
async def get_my_bookings(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    booking_service = BookingService(db)
    bookings = booking_service.get_user_bookings(current_user.id)
    return bookings

@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    booking_service = BookingService(db)
    booking_service.cancel_booking(booking_id, current_user.id)
    return {"message": "Booking cancelled successfully"}

@router.get("/my-tickets")
async def get_my_tickets(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get all tickets for logged-in user (including cancelled)"""
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    # Get all tickets (including from cancelled bookings)
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
            "qr_code": ticket.qr_code if booking.status == "confirmed" else None,  # No QR for cancelled
            "is_used": ticket.is_used,
            "is_cancelled": booking.status == "cancelled",  # Add cancellation flag
            "booking_status": booking.status,  # Add booking status
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
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get specific ticket details"""
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    from app.models.ticket import Ticket
    from app.models.booking import Booking
    
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
    db: Session = Depends(get_db)
):
    """Verify ticket at entry (Staff/Admin endpoint)"""
    from app.models.ticket import Ticket
    from app.models.booking import Booking
    from app.models.event import Event
    from datetime import datetime
    
    ticket = db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first()
    if not ticket:
        return {"valid": False, "message": "Invalid ticket code"}
    
    booking = db.query(Booking).filter(Booking.id == ticket.booking_id).first()
    if booking.status != "confirmed":
        return {"valid": False, "message": f"Booking is {booking.status}"}
    
    event = db.query(Event).filter(Event.id == booking.event_id).first()
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
        "user_name": booking.user.username if hasattr(booking.user, 'username') else "Guest"
    }

@router.get("/pending")
async def get_pending_bookings(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get pending bookings for current user"""
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id,
        Booking.status == "pending"
    ).all()
    return bookings

@router.post("/{booking_id}/confirm")
async def confirm_pending_booking(
    booking_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Confirm a pending booking"""
    token = credentials.credentials
    auth_service = AuthService(db)
    current_user = auth_service.get_current_user(token)
    
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id,
        Booking.status == "pending"
    ).first()
    
    if not booking:
        raise HTTPException(404, "Pending booking not found")
    
    booking.status = "confirmed"
    
    from app.models.ticket import Ticket
    from app.services.booking_service import BookingService
    
    booking_service = BookingService(db)
    for i in range(booking.quantity):
        ticket_code = f"{booking.booking_reference}-{i+1}"
        qr_data = f"TICKET:{ticket_code}:EVENT:{booking.event_id}"
        qr_code = booking_service.generate_qr_code(qr_data)
        ticket = Ticket(
            ticket_code=ticket_code,
            qr_code=qr_code,
            booking_id=booking.id
        )
        db.add(ticket)
    
    db.commit()
    return {"message": "Booking confirmed", "status": "confirmed"}