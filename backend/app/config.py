from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/event_booking"
    SECRET_KEY: str = "your-secret-key-change-this-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_URL: str = "http://localhost:3000"

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # Email settings (optional)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_ENABLED: bool = False
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()