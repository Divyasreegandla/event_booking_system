from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user
from app.models.user import User
from app.services.referral_service import ReferralService
from app.services.reward_service import RewardService
from app.schemas.referral import ReferralCodeResponse, ReferralStatsResponse
from app.models.referral import Referral

router = APIRouter()


@router.get("/my-code", response_model=ReferralCodeResponse)
async def get_my_referral_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's referral code"""
    referral_service = ReferralService(db)
    referral_code = referral_service.get_user_referral_code(current_user.id)
    return referral_code


@router.post("/generate")
async def generate_referral_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new referral code for user"""
    referral_service = ReferralService(db)
    code = referral_service.generate_referral_code(current_user.id)
    return {"referral_code": code, "message": "Referral code generated successfully"}


@router.post("/use")
async def use_referral_code(
    code: str = Query(..., description="Referral code to use"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Use a referral code during signup"""
    referral_service = ReferralService(db)
    
    # Check if user already used a referral code
    existing = db.query(Referral).filter(Referral.referred_user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already used a referral code")
    
    referral = referral_service.process_referral_signup(code, current_user.id)
    if not referral:
        raise HTTPException(status_code=400, detail="Invalid referral code")
    
    return {"message": "Referral code applied successfully", "referral_id": referral.id}


@router.get("/my-referrals")
async def get_my_referrals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of users referred by current user"""
    referral_service = ReferralService(db)
    referrals = referral_service.get_user_referrals(current_user.id)
    return {"referrals": referrals, "count": len(referrals)}


@router.get("/stats", response_model=ReferralStatsResponse)
async def get_referral_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get referral statistics"""
    referral_service = ReferralService(db)
    stats = referral_service.get_referral_stats(current_user.id)
    return stats


@router.post("/complete/{referred_user_id}")
async def complete_referral(
    referred_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a referral as completed (when referred user makes first booking)"""
    # Only admin can mark completion, or it happens automatically
    from app.dependencies.roles import require_admin
    await require_admin(current_user)
    
    referral_service = ReferralService(db)
    referral = referral_service.complete_referral(referred_user_id)
    
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    
    return {"message": "Referral completed successfully", "referral_id": referral.id}