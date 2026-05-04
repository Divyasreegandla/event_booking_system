from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from app.models.coupon import Coupon, DiscountType
from app.schemas.coupon import CouponValidationResponse

class CouponService:
    def __init__(self, db: Session):
        self.db = db
    
    def validate_coupon(self, coupon_code: str, booking_amount: float) -> CouponValidationResponse:
        """Validate coupon and calculate discount"""
        coupon = self.db.query(Coupon).filter(
            Coupon.coupon_code == coupon_code.upper(),
            Coupon.is_active == True
        ).first()
        
        if not coupon:
            return CouponValidationResponse(
                valid=False,
                discount_amount=0,
                final_amount=booking_amount,
                message="Invalid coupon code"
            )
        
        if coupon.expiry_date < datetime.now():
            return CouponValidationResponse(
                valid=False,
                discount_amount=0,
                final_amount=booking_amount,
                message="Coupon has expired"
            )
        
        if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
            return CouponValidationResponse(
                valid=False,
                discount_amount=0,
                final_amount=booking_amount,
                message="Coupon usage limit exceeded"
            )
        
        if booking_amount < coupon.minimum_booking_amount:
            return CouponValidationResponse(
                valid=False,
                discount_amount=0,
                final_amount=booking_amount,
                message=f"Minimum booking amount of ₹{coupon.minimum_booking_amount} required"
            )
        
        if coupon.discount_type == DiscountType.PERCENTAGE:
            discount_amount = booking_amount * (coupon.discount_value / 100)
            discount_amount = min(discount_amount, booking_amount)
        else:
            discount_amount = min(coupon.discount_value, booking_amount)
        
        final_amount = booking_amount - discount_amount
        
        return CouponValidationResponse(
            valid=True,
            discount_amount=round(discount_amount, 2),
            final_amount=round(final_amount, 2),
            message=f"Coupon applied! You saved ₹{round(discount_amount, 2)}",
            coupon_id=coupon.id
        )
    
    def apply_coupon(self, coupon_id: int):
        """Increment coupon usage count"""
        coupon = self.db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if coupon:
            coupon.used_count += 1
            self.db.commit()
    
    def create_coupon(self, coupon_data):
        existing = self.db.query(Coupon).filter(
            Coupon.coupon_code == coupon_data.coupon_code.upper()
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")
        
        coupon = Coupon(
            coupon_code=coupon_data.coupon_code.upper(),
            discount_type=coupon_data.discount_type,
            discount_value=coupon_data.discount_value,
            minimum_booking_amount=coupon_data.minimum_booking_amount,
            expiry_date=coupon_data.expiry_date,
            usage_limit=coupon_data.usage_limit,
            is_active=coupon_data.is_active
        )
        
        self.db.add(coupon)
        self.db.commit()
        self.db.refresh(coupon)
        return coupon
    
    def get_all_coupons(self, skip: int = 0, limit: int = 100):
        return self.db.query(Coupon).offset(skip).limit(limit).all()
    
    def toggle_coupon_status(self, coupon_id: int):
        coupon = self.db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        coupon.is_active = not coupon.is_active
        self.db.commit()
        return coupon