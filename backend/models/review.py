from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone

class ReviewCreate(BaseModel):
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewDispute(BaseModel):
    reason: str = Field(..., min_length=10)

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    order_id: str
    master_id: str
    customer_id: str
    service_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    is_disputed: bool = False
    dispute_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class ReviewWithCustomer(Review):
    customer_name: str
    customer_avatar: Optional[str] = None
