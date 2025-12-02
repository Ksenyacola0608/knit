from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone

class MessageCreate(BaseModel):
    order_id: str
    content: str = Field(..., min_length=1, max_length=2000)

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    order_id: str
    sender_id: str
    receiver_id: str
    content: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
