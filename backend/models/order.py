from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class OrderCreate(BaseModel):
    service_id: str
    description: str = Field(..., min_length=10)
    customer_notes: Optional[str] = None
    attachments: Optional[List[str]] = []

class OrderUpdateStatus(BaseModel):
    status: OrderStatus
    agreed_price: Optional[float] = None
    deadline: Optional[datetime] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    service_id: str
    customer_id: str
    master_id: str
    description: str
    customer_notes: Optional[str] = None
    attachments: Optional[List[str]] = []
    status: OrderStatus = OrderStatus.PENDING
    agreed_price: Optional[float] = None
    deadline: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
