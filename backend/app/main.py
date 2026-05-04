from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, events, bookings, notifications, admin, analytics, payments, coupons, reviews, search
from app.database.session import engine, Base
from app.config import settings
import threading
import time
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.event import Event, EventStatus

# Create database tables
Base.metadata.create_all(bind=engine)

# Function to update event statuses periodically
def update_event_statuses():
    from app.services.event_service import EventService
    while True:
        try:
            db = SessionLocal()
            event_service = EventService(db)
            event_service.update_event_statuses()
            db.close()
        except Exception as e:
            print(f"Error updating event statuses: {e}")
        time.sleep(3600)

# Function to send reminder notifications
def send_reminder_notifications():
    from app.services.notification_service import NotificationService
    while True:
        try:
            db = SessionLocal()
            notification_service = NotificationService(db)
            notification_service.send_upcoming_event_reminders()
            db.close()
        except Exception as e:
            print(f"Error sending reminders: {e}")
        time.sleep(3600)

# Start background tasks
status_thread = threading.Thread(target=update_event_statuses, daemon=True)
status_thread.start()

reminder_thread = threading.Thread(target=send_reminder_notifications, daemon=True)
reminder_thread.start()

app = FastAPI(
    title="SmartEvent - Event Booking API", 
    version="3.0.0",
    description="Event Booking System with RBAC, Organizer Management, Analytics, Payments, Coupons, and Reviews",
    swagger_ui_parameters={"persistAuthorization": True}
)

# CORS
cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print(f"CORS enabled for origins: {cors_origins}")

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(coupons.router, prefix="/api/coupons", tags=["Coupons"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])


@app.get("/")
def root():
    return {
        "message": "SmartEvent API", 
        "status": "running", 
        "version": "3.0.0",
        "features": [
            "Role-Based Access Control",
            "Event Management",
            "Booking System",
            "QR Code Tickets",
            "Email Notifications",
            "Payment System",
            "Coupon & Discount System",
            "Event Reviews & Ratings",
            "Advanced Search & Filtering"
        ]
    }


@app.get("/health")
def health():
    return {"status": "healthy"}