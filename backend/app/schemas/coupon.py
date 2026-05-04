from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class DiscountTypeEnum(str, Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"


class CouponCreate(BaseModel):
    coupon_code: str = Field(..., min_length=3, max_length=50)
    discount_type: DiscountTypeEnum
    discount_value: float = Field(..., gt=0)
    minimum_booking_amount: float = Field(default=0, ge=0)
    expiry_date: datetime
    usage_limit: Optional[int] = Field(None, gt=0)
    is_active: bool = True


class CouponResponse(BaseModel):
    id: int
    coupon_code: str
    discount_type: str
    discount_value: float
    minimum_booking_amount: float
    expiry_date: datetime
    usage_limit: Optional[int]
    used_count: int
    is_active: bool
    
    class Config:
        from_attributes = True


class CouponValidationRequest(BaseModel):
    coupon_code: str
    booking_amount: float


class CouponValidationResponse(BaseModel):
    valid: bool
    discount_amount: float
    final_amount: float
    message: str
    coupon_id: Optional[int] = None