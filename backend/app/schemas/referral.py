from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReferralCodeResponse(BaseModel):
    id: int
    user_id: int
    code: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReferralResponse(BaseModel):
    id: int
    referrer_id: int
    referred_user_id: int
    referred_user_name: Optional[str]
    referral_code: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ReferralStatsResponse(BaseModel):
    total_referrals: int
    completed_referrals: int
    pending_referrals: int
    points_earned: int
    referral_code: str