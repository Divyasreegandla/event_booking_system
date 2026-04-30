from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, events, bookings, notifications, admin, analytics
from app.database.session import engine, Base
from app.config import settings
import threading
import time
from datetime import datetime
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.event import Event, EventStatus

# Create database tables
Base.metadata.create_all(bind=engine)

# Function to update event statuses periodically
def update_event_statuses():
    """Background task to update event statuses"""
    from app.services.event_service import EventService
    while True:
        try:
            db = SessionLocal()
            event_service = EventService(db)
            event_service.update_event_statuses()
            db.close()
        except Exception as e:
            print(f"Error updating event statuses: {e}")
        time.sleep(3600)  # Run every hour

# Start background task
status_thread = threading.Thread(target=update_event_statuses, daemon=True)
status_thread.start()

app = FastAPI(
    title="SmartEvent - Event Booking API", 
    version="2.0.0",
    description="Event Booking System with RBAC, Organizer Management, and Analytics",
    swagger_ui_parameters={
        "persistAuthorization": True,
    }
)

# CORS
cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # This comes from .env now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Print CORS settings on startup (so user knows what's configured)
print(f"CORS enabled for origins: {cors_origins}")

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {
        "message": "SmartEvent API", 
        "status": "running", 
        "version": "2.0.0",
        "features": [
            "Role-Based Access Control (USER/ORGANIZER/ADMIN)",
            "Organizer Event Management",
            "Admin Analytics Dashboard",
            "QR Code Tickets",
            "Email Notifications"
        ]
    }

@app.get("/health")
def health():
    return {"status": "healthy"}