from app.database.session import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.booking import Booking
from app.models.ticket import Ticket
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.coupon import Coupon
from app.models.review import Review
from app.models.wishlist import Wishlist
from app.models.user_activity import UserActivity
from app.models.event_update import EventUpdate
from app.utils.security import get_password_hash
from sqlalchemy import inspect, text

def init_db():
    print("Checking database tables...")
    
    inspector = inspect(engine)
    
    # Create only missing tables
    Base.metadata.create_all(bind=engine)
    
    # Add missing columns if needed
    with engine.connect() as conn:
        # Check and add profile_picture to users
        columns = [col['name'] for col in inspector.get_columns('users')] if inspector.has_table('users') else []
        if 'profile_picture' not in columns and inspector.has_table('users'):
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR NULL"))
            conn.commit()
            print("✅ Added profile_picture column to users")
    
    print("✅ Database schema ready!")
    
    db = SessionLocal()
    
    try:
        admin = db.query(User).filter(User.email == "admin@smartevent.com").first()
        if not admin:
            print("Creating default users...")
            
            admin_user = User(
                email="admin@smartevent.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_admin=True
            )
            db.add(admin_user)
            
            organizer = User(
                email="organizer@smartevent.com",
                username="organizer",
                hashed_password=get_password_hash("organizer123"),
                role=UserRole.ORGANIZER,
                is_admin=False
            )
            db.add(organizer)
            
            demo_user = User(
                email="user@smartevent.com",
                username="user",
                hashed_password=get_password_hash("user123"),
                role=UserRole.USER,
                is_admin=False
            )
            db.add(demo_user)
            
            db.commit()
            print("✅ Default users created:")
            print("   - Admin: admin@smartevent.com / admin123")
            print("   - Organizer: organizer@smartevent.com / organizer123")
            print("   - User: user@smartevent.com / user123")
        else:
            print("Users already exist, skipping creation.")
            
    except Exception as e:
        print(f"Error creating users: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("\n📊 Tables in database:")
    for table in inspector.get_table_names():
        print(f"  - {table}")

if __name__ == "__main__":
    init_db()