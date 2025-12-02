from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum

class ServiceCategory(str, Enum):
    KNITTING = "knitting"
    EMBROIDERY = "embroidery"
    SEWING = "sewing"
    CROCHET = "crochet"
    JEWELRY = "jewelry"
    POTTERY = "pottery"
    WOODWORKING = "woodworking"
    PAINTING = "painting"
    SOAP_MAKING = "soap_making"
    OTHER = "other"

class ServiceCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20)
    category: ServiceCategory
    price: float = Field(..., gt=0)
    currency: str = "RUB"
    duration_days: Optional[int] = Field(None, gt=0)
    images: Optional[List[str]] = []

class ServiceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=20)
    category: Optional[ServiceCategory] = None
    price: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = None
    duration_days: Optional[int] = Field(None, gt=0)
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None

class Service(ServiceCreate):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    master_id: str
    is_active: bool = True
    views: int = 0
    orders_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
