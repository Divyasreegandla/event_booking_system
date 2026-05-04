from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class PaymentMethodEnum(str, Enum):
    CARD = "CARD"
    UPI = "UPI"
    NETBANKING = "NETBANKING"
    WALLET = "WALLET"


class PaymentInitiateRequest(BaseModel):
    booking_id: int
    payment_method: PaymentMethodEnum


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    payment_method: str
    payment_status: str
    transaction_id: str
    amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaymentStatusResponse(BaseModel):
    payment_id: int
    status: str
    message: str