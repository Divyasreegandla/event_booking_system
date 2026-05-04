from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
import enum
from app.database.session import Base


class NotificationType(str, enum.Enum):
    EVENT = "EVENT"
    BOOKING = "BOOKING"
    PAYMENT = "PAYMENT"
    SYSTEM = "SYSTEM"


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    booking_reference = Column(String, nullable=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)