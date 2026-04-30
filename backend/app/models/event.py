from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, Enum as SQLEnum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database.session import Base  # Import from session

class EventStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, index=True)
    venue = Column(String, nullable=False)
    city = Column(String, index=True)
    event_date = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False)
    total_tickets = Column(Integer, nullable=False)
    available_tickets = Column(Integer, nullable=False)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_status = Column(SQLEnum(EventStatus), default=EventStatus.UPCOMING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    organizer = relationship("User", foreign_keys=[organizer_id])