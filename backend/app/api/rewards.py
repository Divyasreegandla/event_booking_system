from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user
from app.models.user import User
from app.services.reward_service import RewardService

router = APIRouter()


@router.get("/my-points")
async def get_my_points(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's points and transaction history"""
    reward_service = RewardService(db)
    points_summary = reward_service.get_user_points_summary(current_user.id)
    return points_summary


@router.get("/my-points/summary")
async def get_points_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get points summary only"""
    reward_service = RewardService(db)
    user_points = reward_service.get_or_create_user_points(current_user.id)
    return {
        "total_points": user_points.total_points,
        "points_per_booking": reward_service.POINTS_PER_BOOKING,
        "points_per_review": reward_service.POINTS_PER_REVIEW,
        "points_per_referral": reward_service.POINTS_PER_REFERRAL
    }


@router.get("/transactions")
async def get_point_transactions(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get point transaction history"""
    from app.models.reward import Reward
    
    transactions = db.query(Reward).filter(
        Reward.user_id == current_user.id
    ).order_by(Reward.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": t.id,
            "points": t.points,
            "reward_type": t.reward_type.value,
            "transaction_type": t.transaction_type.value,
            "description": t.description,
            "created_at": t.created_at
        }
        for t in transactions
    ]