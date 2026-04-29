from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
import secrets
import string
import qrcode
from io import BytesIO
import base64
from app.models.booking import Booking
from app.models.event import Event
from app.models.ticket import Ticket
from app.models.notification import Notification
from app.models.user import User
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

class BookingService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_booking_reference(self):
        alphabet = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(10))
    
    def generate_qr_code(self, data: str):
        try:
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(data)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            return f"data:image/png;base64,{img_str}"
        except Exception as e:
            print(f"QR generation error: {e}")
            return None
    
    def send_email(self, to_email, subject, body):
        """Send email using SMTP"""
        if not settings.EMAIL_ENABLED or not settings.SMTP_USER:
            print(f"Email disabled. Would send to {to_email}: {subject}")
            return True
        
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_USER
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            print(f"Email sent to {to_email}")
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
    
    def send_booking_confirmation_email(self, user_email, username, booking_ref, event, quantity, total_price):
        """Send booking confirmation email"""
        subject = f"🎫 Booking Confirmed: {event.title}"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h2>Booking Confirmed! 🎫</h2>
                </div>
                <div style="padding: 20px; background: #f9fafb;">
                    <p>Dear <strong>{username}</strong>,</p>
                    <p>Your booking has been confirmed successfully!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h3>Event Details:</h3>
                        <p><strong>Event:</strong> {event.title}</p>
                        <p><strong>Date:</strong> {event.event_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                        <p><strong>Venue:</strong> {event.venue}, {event.city}</p>
                        <p><strong>Quantity:</strong> {quantity} ticket(s)</p>
                        <p><strong>Total Price:</strong> ${total_price}</p>
                        <p><strong>Booking Reference:</strong> {booking_ref}</p>
                    </div>
                    
                    <p>Your tickets are ready! You can view and download them from your dashboard.</p>
                    <p style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/tickets" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Tickets</a>
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                    <p>Thank you for booking with SmartEvent!</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(user_email, subject, body)
    
    def send_cancellation_email(self, user_email, username, booking_ref, event, quantity, total_price):
        """Send booking cancellation email"""
        subject = f"❌ Booking Cancelled: {event.title}"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h2>Booking Cancelled ❌</h2>
                </div>
                <div style="padding: 20px; background: #f9fafb;">
                    <p>Dear <strong>{username}</strong>,</p>
                    <p>Your booking has been cancelled as requested.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h3>Cancelled Event Details:</h3>
                        <p><strong>Event:</strong> {event.title}</p>
                        <p><strong>Date:</strong> {event.event_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                        <p><strong>Venue:</strong> {event.venue}, {event.city}</p>
                        <p><strong>Quantity:</strong> {quantity} ticket(s)</p>
                        <p><strong>Refund Amount:</strong> ${total_price}</p>
                        <p><strong>Booking Reference:</strong> {booking_ref}</p>
                    </div>
                    
                    <p>The refund will be processed to your original payment method within 5-7 business days.</p>
                    <p>If you didn't request this cancellation, please contact support immediately.</p>
                </div>
                <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                    <p>Need help? Contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(user_email, subject, body)
    
    def send_reminder_email(self, user_email, username, booking_ref, event):
        """Send event reminder email"""
        days_until = (event.event_date - datetime.now()).days
        
        subject = f"🔔 Reminder: {event.title} starts in {days_until} days"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h2>Event Reminder 🔔</h2>
                </div>
                <div style="padding: 20px; background: #f9fafb;">
                    <p>Dear <strong>{username}</strong>,</p>
                    <p>This is a friendly reminder about your upcoming event!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h3>Event Details:</h3>
                        <p><strong>Event:</strong> {event.title}</p>
                        <p><strong>Date:</strong> {event.event_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                        <p><strong>Venue:</strong> {event.venue}</p>
                        <p><strong>Location:</strong> {event.city}</p>
                        <p><strong>Booking Reference:</strong> {booking_ref}</p>
                    </div>
                    
                    <p><strong>Important Information:</strong></p>
                    <ul>
                        <li>Please arrive at least 30 minutes before the event starts</li>
                        <li>Have your QR code ready for scanning at the entrance</li>
                        <li>Bring a valid ID for verification</li>
                    </ul>
                    
                    <p style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/tickets" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Tickets</a>
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                    <p>Enjoy the event! - SmartEvent Team</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(user_email, subject, body)
    
    def create_notification(self, user_id: int, title: str, message: str, type: str, booking_reference: str = None, event_id: int = None):
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            booking_reference=booking_reference,
            event_id=event_id
        )
        self.db.add(notification)
        self.db.commit()
        return notification
    
    def create_booking(self, user_id: int, event_id: int, quantity: int):
        # Check event
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if event.available_tickets < quantity:
            raise HTTPException(status_code=400, detail="Not enough tickets available")
        
        if event.event_date < datetime.now():
            raise HTTPException(status_code=400, detail="Event has already passed")
        
        # Get user
        user = self.db.query(User).filter(User.id == user_id).first()
        
        # Create booking with PENDING status
        total_price = event.price * quantity
        booking_reference = self.generate_booking_reference()
        
        booking = Booking(
            booking_reference=booking_reference,
            user_id=user_id,
            event_id=event_id,
            quantity=quantity,
            total_price=total_price,
            status="pending"
        )
        
        # Update available tickets
        event.available_tickets -= quantity
        
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        
        # Confirm the booking (simulate successful payment)
        booking.status = "confirmed"
        
        # Create individual tickets with QR codes
        for i in range(quantity):
            ticket_code = f"{booking_reference}-{i+1}"
            qr_data = f"TICKET:{ticket_code}:EVENT:{event_id}"
            qr_code = self.generate_qr_code(qr_data)
            
            ticket = Ticket(
                ticket_code=ticket_code,
                qr_code=qr_code,
                booking_id=booking.id
            )
            self.db.add(ticket)
        
        # Create notification
        self.create_notification(
            user_id=user_id,
            title="🎫 Booking Confirmed!",
            message=f"Your booking {booking_reference} for {quantity} ticket(s) to {event.title} has been confirmed.",
            type="BOOKING",
            booking_reference=booking_reference,
            event_id=event_id
        )
        
        # Send confirmation email
        if user and user.email:
            self.send_booking_confirmation_email(
                user.email,
                user.username,
                booking_reference,
                event,
                quantity,
                total_price
            )
        
        self.db.commit()
        
        return {
            "id": booking.id,
            "booking_reference": booking_reference,
            "event_id": event_id,
            "quantity": quantity,
            "total_price": total_price,
            "status": "confirmed",
            "booking_date": booking.booking_date
        }
    
    def cancel_booking(self, booking_id: int, user_id: int):
        booking = self.db.query(Booking).filter(
            Booking.id == booking_id,
            Booking.user_id == user_id
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking.status == "cancelled":
            raise HTTPException(status_code=400, detail="Booking already cancelled")
        
        # Only confirmed bookings can be cancelled
        if booking.status != "confirmed":
            raise HTTPException(status_code=400, detail="Only confirmed bookings can be cancelled")
        
        event = self.db.query(Event).filter(Event.id == booking.event_id).first()
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if event:
            event.available_tickets += booking.quantity
        
        booking.status = "cancelled"
        
        # Create cancellation notification
        self.create_notification(
            user_id=user_id,
            title="❌ Booking Cancelled",
            message=f"Your booking {booking.booking_reference} for {event.title} has been cancelled.",
            type="BOOKING",
            booking_reference=booking.booking_reference,
            event_id=booking.event_id
        )
        
        # Send cancellation email
        if user and user.email and event:
            self.send_cancellation_email(
                user.email,
                user.username,
                booking.booking_reference,
                event,
                booking.quantity,
                booking.total_price
            )
        
        self.db.commit()
        return True
    
    def get_user_bookings(self, user_id: int):
        bookings = self.db.query(Booking).filter(Booking.user_id == user_id).all()
        result = []
        for booking in bookings:
            event = self.db.query(Event).filter(Event.id == booking.event_id).first()
            # Only get tickets if booking is confirmed
            tickets = []
            if booking.status == "confirmed":
                tickets = self.db.query(Ticket).filter(Ticket.booking_id == booking.id).all()
            
            result.append({
                "id": booking.id,
                "booking_reference": booking.booking_reference,
                "event_id": booking.event_id,
                "quantity": booking.quantity,
                "total_price": booking.total_price,
                "status": booking.status,
                "booking_date": booking.booking_date,
                "event_title": event.title if event else "Unknown",
                "event_date": event.event_date if event else None,
                "venue": event.venue if event else "Unknown",
                "city": event.city if event else "Unknown",
                "tickets": [{"ticket_code": t.ticket_code, "qr_code": t.qr_code, "is_used": t.is_used} for t in tickets]
            })
        return result

    def send_reminder(self, booking_id: int, user_id: int):
        """Send reminder email for a booking"""
        booking = self.db.query(Booking).filter(
            Booking.id == booking_id,
            Booking.user_id == user_id
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking.status != "confirmed":
            raise HTTPException(status_code=400, detail="Only confirmed bookings can get reminders")
        
        event = self.db.query(Event).filter(Event.id == booking.event_id).first()
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not event or not user:
            raise HTTPException(status_code=404, detail="Event or user not found")
        
        if event.event_date < datetime.now():
            raise HTTPException(status_code=400, detail="Event has already passed")
        
        # Send reminder email
        email_sent = self.send_reminder_email(
            user.email,
            user.username,
            booking.booking_reference,
            event
        )
        
        # Create reminder notification
        self.create_notification(
            user_id=user_id,
            title="🔔 Event Reminder Sent",
            message=f"Reminder email sent for {event.title} on {event.event_date.strftime('%B %d, %Y')}",
            type="EVENT_REMINDER",
            booking_reference=booking.booking_reference,
            event_id=booking.event_id
        )
        
        return {"email_sent": email_sent, "message": f"Reminder sent for {event.title}"}