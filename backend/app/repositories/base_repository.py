from typing import List, Optional, Any
from sqlalchemy.orm import Session
from app.database.session import Base


class BaseRepository:
    def __init__(self, db: Session, model: Any):
        self.db = db
        self.model = model

    def get_all(self, skip: int = 0, limit: int = 100, **filters) -> List[Any]:
        query = self.db.query(self.model)
        for key, value in filters.items():
            if value is not None:
                query = query.filter(getattr(self.model, key) == value)
        return query.offset(skip).limit(limit).all()

    def get_by_id(self, id: int) -> Optional[Any]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def create(self, **kwargs) -> Any:
        instance = self.model(**kwargs)
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def update(self, id: int, **kwargs) -> Optional[Any]:
        instance = self.get_by_id(id)
        if instance:
            for key, value in kwargs.items():
                if value is not None:
                    setattr(instance, key, value)
            self.db.commit()
            self.db.refresh(instance)
        return instance

    def delete(self, id: int) -> bool:
        instance = self.get_by_id(id)
        if instance:
            self.db.delete(instance)
            self.db.commit()
            return True
        return False

    def count(self, **filters) -> int:
        query = self.db.query(self.model)
        for key, value in filters.items():
            if value is not None:
                query = query.filter(getattr(self.model, key) == value)
        return query.count()