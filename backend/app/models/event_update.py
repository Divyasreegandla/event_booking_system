from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.session import Base

class EventUpdate(Base):
    __tablename__ = "event_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    message = Column(Text, nullable=False)
    update_type = Column(String, default="announcement")  # announcement, reminder, change, cancellation
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())