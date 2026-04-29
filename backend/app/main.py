from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, events, bookings, notifications, admin
from app.database.session import engine, Base
from app.config import settings
# Start reminder service

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartEvent - Event Booking API", 
    version="1.0.0",
    description="Event Booking System with Notifications and QR Tickets",
    swagger_ui_parameters={
        "persistAuthorization": True,
    }
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.get("/")
def root():
    return {"message": "SmartEvent API", "status": "running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

from app.services import reminder_service