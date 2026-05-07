from sqlalchemy.orm import Session
from app.models.reward import Reward, RewardType, RewardTransactionType, UserPoints
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.models.user import User


class RewardService:
    # Point values
    POINTS_PER_BOOKING = 10
    POINTS_PER_REVIEW = 5
    POINTS_PER_REFERRAL = 50
    POINTS_SIGNUP_BONUS = 20
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_or_create_user_points(self, user_id: int) -> UserPoints:
        """Get or create user points record"""
        user_points = self.db.query(UserPoints).filter(UserPoints.user_id == user_id).first()
        if not user_points:
            user_points = UserPoints(
                user_id=user_id,
                total_points=0
            )
            self.db.add(user_points)
            self.db.commit()
            self.db.refresh(user_points)
        return user_points
    
    def add_points(self, user_id: int, points: int, reward_type: RewardType, 
                   reference_id: int = None, description: str = None) -> Reward:
        """Add points to user"""
        # Get or create user points
        user_points = self.get_or_create_user_points(user_id)
        
        # Create transaction record
        transaction = Reward(
            user_id=user_id,
            points=points,
            reward_type=reward_type,
            transaction_type=RewardTransactionType.CREDIT,
            reference_id=reference_id,
            description=description or f"{points} points earned from {reward_type.value}"
        )
        
        # Update total points
        user_points.total_points += points
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        
        return transaction
    
    def deduct_points(self, user_id: int, points: int, reward_type: RewardType,
                      reference_id: int = None, description: str = None) -> Reward:
        """Deduct points from user"""
        user_points = self.get_or_create_user_points(user_id)
        
        if user_points.total_points < points:
            raise ValueError("Insufficient points")
        
        transaction = Reward(
            user_id=user_id,
            points=points,
            reward_type=reward_type,
            transaction_type=RewardTransactionType.DEBIT,
            reference_id=reference_id,
            description=description or f"{points} points deducted"
        )
        
        user_points.total_points -= points
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        
        return transaction
    
    def award_booking_points(self, booking_id: int, user_id: int) -> Reward:
        """Award points for booking"""
        # Check if already awarded
        existing = self.db.query(Reward).filter(
            Reward.reference_id == booking_id,
            Reward.reward_type == RewardType.BOOKING
        ).first()
        
        if existing:
            return existing
        
        return self.add_points(
            user_id=user_id,
            points=self.POINTS_PER_BOOKING,
            reward_type=RewardType.BOOKING,
            reference_id=booking_id,
            description=f"Points earned for booking #{booking_id}"
        )
    
    def award_review_points(self, review_id: int, user_id: int) -> Reward:
        """Award points for writing a review"""
        existing = self.db.query(Reward).filter(
            Reward.reference_id == review_id,
            Reward.reward_type == RewardType.REVIEW
        ).first()
        
        if existing:
            return existing
        
        return self.add_points(
            user_id=user_id,
            points=self.POINTS_PER_REVIEW,
            reward_type=RewardType.REVIEW,
            reference_id=review_id,
            description=f"Points earned for writing a review"
        )
    
    def award_referral_points(self, referrer_id: int, referred_user_id: int) -> Reward:
        """Award points for successful referral"""
        return self.add_points(
            user_id=referrer_id,
            points=self.POINTS_PER_REFERRAL,
            reward_type=RewardType.REFERRAL,
            reference_id=referred_user_id,
            description=f"Points earned for referring a new user"
        )
    
    def award_signup_bonus(self, user_id: int) -> Reward:
        """Award signup bonus points"""
        existing = self.db.query(Reward).filter(
            Reward.user_id == user_id,
            Reward.reward_type == RewardType.SIGNUP
        ).first()
        
        if existing:
            return existing
        
        return self.add_points(
            user_id=user_id,
            points=self.POINTS_SIGNUP_BONUS,
            reward_type=RewardType.SIGNUP,
            description=f"Welcome bonus points"
        )
    
    def get_user_points_summary(self, user_id: int) -> dict:
        """Get user points summary with transaction history"""
        user_points = self.get_or_create_user_points(user_id)
        
        transactions = self.db.query(Reward).filter(
            Reward.user_id == user_id
        ).order_by(Reward.created_at.desc()).limit(50).all()
        
        # Calculate points earned by type
        points_by_type = {}
        for t in transactions:
            if t.reward_type.value not in points_by_type:
                points_by_type[t.reward_type.value] = 0
            points_by_type[t.reward_type.value] += t.points
        
        return {
            "user_id": user_id,
            "total_points": user_points.total_points,
            "points_by_type": points_by_type,
            "recent_transactions": [
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
        }
    
    def can_redeem_points(self, user_id: int, points_needed: int) -> bool:
        """Check if user has enough points"""
        user_points = self.get_or_create_user_points(user_id)
        return user_points.total_points >= points_needed