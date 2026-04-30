from typing import Optional, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.repositories.base_repository import BaseRepository
from app.models.user import User, UserRole
from app.models.booking import Booking


class UserRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, User)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_role(self, role: UserRole, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).filter(User.role == role).offset(skip).limit(limit).all()

    def update_role(self, user_id: int, role: UserRole) -> Optional[User]:
        return self.update(user_id, role=role, is_admin=(role == UserRole.ADMIN))

    def get_organizers(self) -> List[User]:
        return self.db.query(User).filter(User.role == UserRole.ORGANIZER).all()

    def get_all_with_stats(self) -> List[Any]:
        users = self.db.query(
            User.id,
            User.email,
            User.username,
            User.role,
            User.created_at,
            func.count(Booking.id).label('total_bookings'),
            func.sum(Booking.total_price).label('total_spent')
        ).outerjoin(Booking, Booking.user_id == User.id).group_by(User.id).all()
        
        return users

    def get_user_count_by_role(self) -> dict:
        counts = self.db.query(
            User.role,
            func.count(User.id).label('count')
        ).group_by(User.role).all()
        
        return {count.role.value: count.count for count in counts}