from pydantic import BaseModel
from typing import Optional, Dict, Any

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    response_type: str
    content: str
    portfolio_data: Optional[Dict[str, Any]] = None
