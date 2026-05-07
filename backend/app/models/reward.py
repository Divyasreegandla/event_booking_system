from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
import enum
from app.database.session import Base


class RewardType(str, enum.Enum):
    BOOKING = "BOOKING"
    REVIEW = "REVIEW"
    REFERRAL = "REFERRAL"
    SIGNUP = "SIGNUP"


class RewardTransactionType(str, enum.Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"


class Reward(Base):
    __tablename__ = "rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    points = Column(Integer, nullable=False, default=0)
    reward_type = Column(SQLEnum(RewardType), nullable=False)
    transaction_type = Column(SQLEnum(RewardTransactionType), nullable=False)
    reference_id = Column(Integer, nullable=True)  # booking_id or review_id
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserPoints(Base):
    __tablename__ = "user_points"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    total_points = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())