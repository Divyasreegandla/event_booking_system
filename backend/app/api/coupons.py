from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user, require_admin
from app.models.user import User
from app.services.coupon_service import CouponService
from app.schemas.coupon import (
    CouponCreate, CouponResponse, 
    CouponValidationRequest, CouponValidationResponse
)

router = APIRouter()


@router.post("/validate", response_model=CouponValidationResponse)
async def validate_coupon(
    request: CouponValidationRequest,
    db: Session = Depends(get_db)
):
    coupon_service = CouponService(db)
    return coupon_service.validate_coupon(request.coupon_code, request.booking_amount)


@router.post("/", response_model=CouponResponse)
async def create_coupon(
    coupon_data: CouponCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    coupon_service = CouponService(db)
    return coupon_service.create_coupon(coupon_data)


@router.get("/", response_model=list[CouponResponse])
async def get_all_coupons(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    coupon_service = CouponService(db)
    return coupon_service.get_all_coupons(skip, limit)


@router.patch("/{coupon_id}/toggle")
async def toggle_coupon_status(
    coupon_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    coupon_service = CouponService(db)
    coupon = coupon_service.toggle_coupon_status(coupon_id)
    return {"message": f"Coupon {coupon.coupon_code} is now {'active' if coupon.is_active else 'inactive'}"}