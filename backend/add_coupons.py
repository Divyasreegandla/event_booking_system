from app.database.session import SessionLocal
from app.models.coupon import Coupon, DiscountType
from datetime import datetime, timedelta

db = SessionLocal()


def create_coupons():
    """Create sample coupons"""
    coupons = [
        Coupon(
            coupon_code="WELCOME10",
            discount_type=DiscountType.PERCENTAGE,
            discount_value=10,
            minimum_booking_amount=500,
            expiry_date=datetime.now() + timedelta(days=30),
            usage_limit=100,
            is_active=True
        ),
        Coupon(
            coupon_code="FLAT200",
            discount_type=DiscountType.FIXED,
            discount_value=200,
            minimum_booking_amount=1000,
            expiry_date=datetime.now() + timedelta(days=60),
            usage_limit=50,
            is_active=True
        ),
        Coupon(
            coupon_code="SAVE20",
            discount_type=DiscountType.PERCENTAGE,
            discount_value=20,
            minimum_booking_amount=1500,
            expiry_date=datetime.now() + timedelta(days=90),
            usage_limit=None,
            is_active=True
        ),
        Coupon(
            coupon_code="EARLYBIRD15",
            discount_type=DiscountType.PERCENTAGE,
            discount_value=15,
            minimum_booking_amount=0,
            expiry_date=datetime.now() + timedelta(days=15),
            usage_limit=200,
            is_active=True
        ),
        Coupon(
            coupon_code="STUDENT25",
            discount_type=DiscountType.PERCENTAGE,
            discount_value=25,
            minimum_booking_amount=500,
            expiry_date=datetime.now() + timedelta(days=45),
            usage_limit=150,
            is_active=True
        ),
    ]
    
    for coupon in coupons:
        existing = db.query(Coupon).filter(Coupon.coupon_code == coupon.coupon_code).first()
        if not existing:
            db.add(coupon)
            print(f"✅ Added coupon: {coupon.coupon_code}")
        else:
            print(f"⚠️ Coupon already exists: {coupon.coupon_code}")
    
    db.commit()
    print("\n🎟️ All coupons added successfully!")


def list_coupons():
    """List all coupons"""
    coupons = db.query(Coupon).all()
    print("\n📋 Current Coupons:")
    print("-" * 70)
    for coupon in coupons:
        expiry = coupon.expiry_date.strftime('%Y-%m-%d')
        print(f"   {coupon.coupon_code}: {coupon.discount_type.value} {coupon.discount_value} - "
              f"Min: ₹{coupon.minimum_booking_amount} - "
              f"Expires: {expiry} - "
              f"Used: {coupon.used_count}/{coupon.usage_limit if coupon.usage_limit else '∞'}")
    print("-" * 70)


if __name__ == "__main__":
    print("=" * 70)
    print("🎟️ COUPON MANAGEMENT SCRIPT")
    print("=" * 70)
    
    create_coupons()
    list_coupons()
    
    db.close()