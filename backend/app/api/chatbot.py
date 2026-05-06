from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user
from app.models.user import User
from app.services.chatbot_service import ChatbotService
from app.schemas.chatbot import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process a chat message and return AI response"""
    chatbot_service = ChatbotService(db)
    response = chatbot_service.process_message(request.message, current_user.id)
    return response


@router.post("/guest-chat", response_model=ChatResponse)
async def guest_chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Process a chat message for guest users (no login required)"""
    chatbot_service = ChatbotService(db)
    response = chatbot_service.process_message(request.message, None)
    return response