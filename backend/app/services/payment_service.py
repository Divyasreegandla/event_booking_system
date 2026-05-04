import secrets
import secrets
import string
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.models.booking import Booking, BookingStatus
from app.services.notification_service import NotificationService

class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService(db)
    
    def generate_transaction_id(self):
        """Generate unique transaction ID"""
        prefix = "TXN"
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))
        return f"{prefix}{random_part}"
    
    def initiate_payment(self, booking_id: int, user_id: int, payment_method: PaymentMethod):
        """Initiate a payment for a booking"""
        from app.models.booking import Booking
        
        booking = self.db.query(Booking).filter(
            Booking.id == booking_id,
            Booking.user_id == user_id
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking.status != BookingStatus.PENDING:
            raise HTTPException(status_code=400, detail="Booking is not in pending state")
        
        # Check if payment already exists
        existing_payment = self.db.query(Payment).filter(Payment.booking_id == booking_id).first()
        if existing_payment:
            return existing_payment
        
        transaction_id = self.generate_transaction_id()
        
        payment = Payment(
            booking_id=booking_id,
            payment_method=payment_method,
            payment_status=PaymentStatus.PENDING,
            transaction_id=transaction_id,
            amount=booking.final_amount
        )
        
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        
        return payment
    
    def simulate_payment_processing(self, payment_id: int, user_id: int, success: bool = True):
        """Simulate payment gateway processing (for demo)"""
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        booking = self.db.query(Booking).filter(Booking.id == payment.booking_id).first()
        
        if booking.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your payment")
        
        if payment.payment_status != PaymentStatus.PENDING:
            raise HTTPException(status_code=400, detail="Payment already processed")
        
        if success:
            payment.payment_status = PaymentStatus.SUCCESS
            payment.gateway_response = "Payment processed successfully via simulation"
            
            from app.services.booking_service import BookingService
            booking_service = BookingService(self.db)
            booking_service.confirm_booking(booking.id)
            
            self.notification_service.create_notification(
                user_id=user_id,
                title="✅ Payment Successful",
                message=f"Payment of ₹{payment.amount} for booking {booking.booking_reference} was successful. Your booking is now confirmed.",
                type="PAYMENT",
                booking_reference=booking.booking_reference,
                event_id=booking.event_id
            )
            
            message = "Payment successful! Your booking is confirmed."
            booking_status = "confirmed"
        else:
            payment.payment_status = PaymentStatus.FAILED
            payment.gateway_response = "Payment failed during simulation"
            
            self.notification_service.create_notification(
                user_id=user_id,
                title="❌ Payment Failed",
                message=f"Payment of ₹{payment.amount} for booking {booking.booking_reference} failed. Please try again.",
                type="PAYMENT",
                booking_reference=booking.booking_reference,
                event_id=booking.event_id
            )
            
            message = "Payment failed. Please try again."
            booking_status = booking.status.value
        
        self.db.commit()
        
        # Make sure to return the transaction_id
        return {
            "payment_id": payment.id,
            "status": payment.payment_status.value,
            "message": message,
            "booking_status": booking_status,
            "transaction_id": payment.transaction_id,  # ← ADD THIS LINE
            "amount": payment.amount                   # ← ADD THIS LINE
        }
    
    def get_payment_status(self, booking_id: int, user_id: int):
        """Get payment status for a booking"""
        payment = self.db.query(Payment).filter(Payment.booking_id == booking_id).first()
        
        if not payment:
            return {"status": "NOT_INITIATED", "message": "No payment found for this booking"}
        
        booking = self.db.query(Booking).filter(Booking.id == booking_id).first()
        if booking.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your booking")
        
        return {
            "payment_id": payment.id,
            "status": payment.payment_status.value,
            "amount": payment.amount,
            "transaction_id": payment.transaction_id,
            "created_at": payment.created_at
        }