from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from jose import JWTError, jwt
from app.models.user import User, UserRole
from app.schemas.auth import UserCreate
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.config import settings
from app.services.reward_service import RewardService


class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def register_user(self, user_data: UserCreate):
        # Check if user exists
        existing_user = self.db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Email or username already registered")
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            role=user_data.role,
            is_admin=(user_data.role == UserRole.ADMIN)
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        if user_data.referral_code:
            from app.services.referral_service import ReferralService
            referral_service = ReferralService(self.db)
            referral_service.process_referral_signup(user_data.referral_code, db_user.id)
        reward_service = RewardService(self.db)
        reward_service.award_signup_bonus(db_user.id)
        
        return db_user
    
    def authenticate_user(self, email: str, password: str):
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False
        return user
    
    def get_current_user(self, token: str):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception
        
        user = self.db.query(User).filter(User.email == email).first()
        if user is None:
            raise credentials_exception
        return user