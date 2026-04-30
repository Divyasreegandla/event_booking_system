from app.database.session import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.event import Event
from app.models.booking import Booking
from app.models.ticket import Ticket
from app.models.notification import Notification
from app.utils.security import get_password_hash

def init_db():
    print("Creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully!")
    
    db = SessionLocal()
    
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@smartevent.com").first()
        if not admin:
            print("Creating default users...")
            
            # Create admin user
            admin_user = User(
                email="admin@smartevent.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_admin=True
            )
            db.add(admin_user)
            
            # Create organizer user
            organizer = User(
                email="organizer@smartevent.com",
                username="organizer",
                hashed_password=get_password_hash("organizer123"),
                role=UserRole.ORGANIZER,
                is_admin=False
            )
            db.add(organizer)
            
            # Create regular user
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
    
    print("\n📊 Tables created:")
    for table in Base.metadata.tables:
        print(f"  - {table}")

if __name__ == "__main__":
    init_db()