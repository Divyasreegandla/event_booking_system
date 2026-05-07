from sqlalchemy.orm import Session
from fastapi import HTTPException
import secrets
import string
from datetime import datetime
from app.models.referral import ReferralCode, Referral
from app.models.user import User
from app.services.reward_service import RewardService, RewardType


class ReferralService:
    def __init__(self, db: Session):
        self.db = db
        self.reward_service = RewardService(db)
    
    def generate_referral_code(self, user_id: int) -> str:
        """Generate unique referral code for user"""
        # Check if user already has a code
        existing = self.db.query(ReferralCode).filter(ReferralCode.user_id == user_id).first()
        if existing:
            return existing.code
        
        # Generate unique code
        while True:
            # Format: SMART + user_id + random chars
            random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
            code = f"SMART{user_id}{random_part}"
            
            # Check uniqueness
            existing_code = self.db.query(ReferralCode).filter(ReferralCode.code == code).first()
            if not existing_code:
                break
        
        referral_code = ReferralCode(
            user_id=user_id,
            code=code,
            is_active=True
        )
        
        self.db.add(referral_code)
        self.db.commit()
        self.db.refresh(referral_code)
        
        return code
    
    def get_user_referral_code(self, user_id: int) -> ReferralCode:
        """Get user's referral code"""
        referral_code = self.db.query(ReferralCode).filter(ReferralCode.user_id == user_id).first()
        if not referral_code:
            referral_code = ReferralCode(
                user_id=user_id,
                code=self.generate_referral_code(user_id),
                is_active=True
            )
            self.db.add(referral_code)
            self.db.commit()
            self.db.refresh(referral_code)
        
        return referral_code
    
    def process_referral_signup(self, referral_code: str, new_user_id: int):
        """Process when a user signs up using a referral code"""
        # Find the referral code
        code_record = self.db.query(ReferralCode).filter(
            ReferralCode.code == referral_code,
            ReferralCode.is_active == True
        ).first()
        
        if not code_record:
            # Invalid or inactive code - just ignore, don't create referral
            return None
        
        # Don't allow self-referral
        if code_record.user_id == new_user_id:
            return None
        
        # Check if already referred
        existing = self.db.query(Referral).filter(
            Referral.referred_user_id == new_user_id
        ).first()
        
        if existing:
            return existing
        
        # Create referral record
        referral = Referral(
            referrer_id=code_record.user_id,
            referred_user_id=new_user_id,
            referral_code=referral_code,
            status="pending"
        )
        
        self.db.add(referral)
        self.db.commit()
        self.db.refresh(referral)
        
        return referral
    
    def complete_referral(self, referred_user_id: int):
        """Mark referral as completed (when referred user makes first booking)"""
        referral = self.db.query(Referral).filter(
            Referral.referred_user_id == referred_user_id,
            Referral.status == "pending"
        ).first()
        
        if not referral:
            return None
        
        referral.status = "completed"
        referral.completed_at = datetime.now()
        
        # Award points to referrer
        self.reward_service.award_referral_points(referral.referrer_id, referred_user_id)
        
        self.db.commit()
        
        return referral
    
    def get_user_referrals(self, user_id: int) -> list:
        """Get all referrals made by user"""
        referrals = self.db.query(Referral).filter(
            Referral.referrer_id == user_id
        ).order_by(Referral.created_at.desc()).all()
        
        result = []
        for ref in referrals:
            referred_user = self.db.query(User).filter(User.id == ref.referred_user_id).first()
            result.append({
                "id": ref.id,
                "referrer_id": ref.referrer_id,
                "referred_user_id": ref.referred_user_id,
                "referred_user_name": referred_user.username if referred_user else None,
                "referral_code": ref.referral_code,
                "status": ref.status,
                "created_at": ref.created_at,
                "completed_at": ref.completed_at
            })
        
        return result
    
    def get_referral_stats(self, user_id: int) -> dict:
        """Get referral statistics for user"""
        referrals = self.db.query(Referral).filter(Referral.referrer_id == user_id).all()
        
        total = len(referrals)
        completed = len([r for r in referrals if r.status == "completed"])
        pending = len([r for r in referrals if r.status == "pending"])
        
        # Calculate points earned from referrals
        points_earned = completed * self.reward_service.POINTS_PER_REFERRAL
        
        referral_code = self.get_user_referral_code(user_id)
        
        return {
            "total_referrals": total,
            "completed_referrals": completed,
            "pending_referrals": pending,
            "points_earned": points_earned,
            "referral_code": referral_code.code
        }