from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    intent: str
    quick_replies: Optional[List[str]] = None
    data: Optional[dict] = None