from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user
from app.models.user import User
from app.services.payment_service import PaymentService
from app.schemas.payment import PaymentInitiateRequest
from app.models.booking import Booking
from app.models.payment import Payment

router = APIRouter()


@router.post("/initiate")
async def initiate_payment(
    request: PaymentInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate a payment for a booking"""
    payment_service = PaymentService(db)
    payment = payment_service.initiate_payment(
        request.booking_id,
        current_user.id,
        request.payment_method
    )
    return {
        "payment_id": payment.id,
        "transaction_id": payment.transaction_id,
        "amount": payment.amount,
        "status": payment.payment_status.value,
        "message": "Payment initiated. Please complete the payment."
    }


@router.post("/simulate/{payment_id}")
async def simulate_payment(
    payment_id: int,
    success: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Simulate payment processing (for demo)"""
    payment_service = PaymentService(db)
    result = payment_service.simulate_payment_processing(payment_id, current_user.id, success)
    return result


@router.get("/status/{booking_id}")
async def get_payment_status(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment status for a booking"""
    payment_service = PaymentService(db)
    return payment_service.get_payment_status(booking_id, current_user.id)


@router.get("/booking/{booking_id}")
async def get_payment_by_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment details for a booking"""
    payment_service = PaymentService(db)
    payment = payment_service.db.query(Payment).filter(Payment.booking_id == booking_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    booking = payment_service.db.query(Booking).filter(Booking.id == booking_id).first()
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    
    return payment