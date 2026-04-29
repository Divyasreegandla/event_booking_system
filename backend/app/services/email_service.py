import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.email_enabled = getattr(settings, 'EMAIL_ENABLED', True)
    
    def send_email(self, to_email: str, subject: str, body: str, html_body: str = None):
        """Send email using SMTP"""
        if not self.email_enabled:
            logger.info(f"Email disabled. Would send to {to_email}: {subject}")
            return True
        
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Attach plain text version
            msg.attach(MIMEText(body, 'plain'))
            
            # Attach HTML version if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent to {to_email}: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    def send_booking_confirmation(self, user_email: str, username: str, booking, event):
        """Send booking confirmation email"""
        subject = f"🎫 Booking Confirmed: {event.title}"
        
        body = f"""
Dear {username},

Your booking has been confirmed!

Booking Details:
----------------
Event: {event.title}
Date: {event.event_date.strftime('%B %d, %Y at %I:%M %p')}
Venue: {event.venue}, {event.city}
Quantity: {booking.quantity} ticket(s)
Total Price: ${booking.total_price}
Booking Reference: {booking.booking_reference}

Your tickets have been generated. You can view and download them from your dashboard.

Thank you for booking with EventHub!
        """
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ padding: 20px; background: #f9fafb; }}
        .details {{ background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        .button {{ background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🎫 Booking Confirmed!</h2>
        </div>
        <div class="content">
            <p>Dear <strong>{username}</strong>,</p>
            <p>Your booking has been confirmed successfully!</p>
            
            <div class="details">
                <h3>Event Details:</h3>
                <p><strong>Event:</strong> {event.title}</p>
                <p><strong>Date:</strong> {event.event_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                <p><strong>Venue:</strong> {event.venue}, {event.city}</p>
                <p><strong>Quantity:</strong> {booking.quantity} ticket(s)</p>
                <p><strong>Total Price:</strong> ${booking.total_price}</p>
                <p><strong>Booking Reference:</strong> {booking.booking_reference}</p>
            </div>
            
            <p>Your tickets are ready! Click the button below to view and download them:</p>
            <p style="text-align: center;">
                <a href="{settings.FRONTEND_URL}/tickets" class="button">View My Tickets</a>
            </p>
        </div>
        <div class="footer">
            <p>Thank you for booking with EventHub!</p>
        </div>
    </div>
</body>
</html>
        """
        
        return self.send_email(user_email, subject, body, html_body)
    
    def send_booking_cancellation(self, user_email: str, username: str, booking, event):
        """Send booking cancellation email"""
        subject = f"❌ Booking Cancelled: {event.title}"
        
        body = f"""
Dear {username},

Your booking has been cancelled.

Booking Details:
----------------
Event: {event.title}
Date: {event.event_date.strftime('%B %d, %Y at %I:%M %p')}
Quantity: {booking.quantity} ticket(s)
Total Refund: ${booking.total_price}
Booking Reference: {booking.booking_reference}

The amount will be refunded to your original payment method within 5-7 business days.

If you didn't request this cancellation, please contact support immediately.

Thank you,
EventHub Team
        """
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ padding: 20px; background: #f9fafb; }}
        .details {{ background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>❌ Booking Cancelled</h2>
        </div>
        <div class="content">
            <p>Dear <strong>{username}</strong>,</p>
            <p>Your booking has been cancelled as requested.</p>
            
            <div class="details">
                <h3>Cancelled Booking Details:</h3>
                <p><strong>Event:</strong> {event.title}</p>
                <p><strong>Date:</strong> {event.event_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                <p><strong>Quantity:</strong> {booking.quantity} ticket(s)</p>
                <p><strong>Refund Amount:</strong> ${booking.total_price}</p>
                <p><strong>Booking Reference:</strong> {booking.booking_reference}</p>
            </div>
            
            <p>The refund will be processed to your original payment method within 5-7 business days.</p>
        </div>
        <div class="footer">
            <p>Need help? Contact our support team.</p>
        </div>
    </div>
</body>
</html>
        """
        
        return self.send_email(user_email, subject, body, html_body)
    
    def send_event_reminder(self, user_email: str, username: str, booking, event):
        """Send event reminder email"""
        days_until = (event.event_date - event.event_date.now()).days if hasattr(event, 'event_date') else 1
        
        subject = f"🔔 Reminder: {event.title} starts in {days_until} days"
        
        body = f"""
Dear {username},

This is a friendly reminder about your upcoming event!

Event Details:
--------------
Event: {event.title}
Date: {event.event_date.strftime('%B %d, %Y at %I:%M %p')}
Venue: {event.venue}
Address: {event.city}
Quantity: {booking.quantity} ticket(s)
Booking Reference: {booking.booking_reference}

Please arrive at least 30 minutes before the event start time.

Don't forget to bring your ticket QR code for entry. You can access your tickets from your dashboard.

Enjoy the event!
EventHub Team
        """
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ padding: 20px; background: #f9fafb; }}
        .details {{ background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        .button {{ background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 Event Reminder</h2>
        </div>
        <div class="content">
            <p>Dear <strong>{username}</strong>,</p>
            <p>This is a friendly reminder about your upcoming event <strong>{event.title}</strong>!</p>
            
            <div class="details">
                <h3>Event Details:</h3>
                <p><strong>Event:</strong> {event.title}</p>
                <p><strong>Date:</strong> {event.event_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Location:</strong> {event.city}</p>
                <p><strong>Quantity:</strong> {booking.quantity} ticket(s)</p>
                <p><strong>Booking Reference:</strong> {booking.booking_reference}</p>
            </div>
            
            <p><strong>Important Information:</strong></p>
            <ul>
                <li>Please arrive at least 30 minutes before the event starts</li>
                <li>Have your QR code ready for scanning at the entrance</li>
                <li>Bring a valid ID for verification</li>
            </ul>
            
            <p style="text-align: center;">
                <a href="{settings.FRONTEND_URL}/tickets" class="button">View My Tickets</a>
            </p>
        </div>
        <div class="footer">
            <p>Enjoy the event! - EventHub Team</p>
        </div>
    </div>
</body>
</html>
        """
        
        return self.send_email(user_email, subject, body, html_body)

email_service = EmailService()