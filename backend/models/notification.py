from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
from enum import Enum

class NotificationType(str, Enum):
    NEW_ORDER = "new_order"
    ORDER_ACCEPTED = "order_accepted"
    ORDER_REJECTED = "order_rejected"
    ORDER_COMPLETED = "order_completed"
    NEW_MESSAGE = "new_message"
    NEW_REVIEW = "new_review"
    REVIEW_DISPUTED = "review_disputed"

class NotificationCreate(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    content: str
    link: Optional[str] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    type: NotificationType
    title: str
    content: str
    link: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
