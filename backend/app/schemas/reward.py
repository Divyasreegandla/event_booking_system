from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class RewardTypeEnum(str, Enum):
    BOOKING = "BOOKING"
    REVIEW = "REVIEW"
    REFERRAL = "REFERRAL"
    SIGNUP = "SIGNUP"


class RewardTransactionResponse(BaseModel):
    id: int
    points: int
    reward_type: str
    transaction_type: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserPointsResponse(BaseModel):
    user_id: int
    total_points: int
    transactions: list[RewardTransactionResponse]
    
    class Config:
        from_attributes = True