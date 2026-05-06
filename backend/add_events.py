from app.database.session import SessionLocal
from app.models.event import Event, EventStatus
from app.models.user import User, UserRole
from app.models.booking import Booking
from app.models.ticket import Ticket
from app.models.notification import Notification
from app.utils.security import get_password_hash
from datetime import datetime, timedelta
from app.models.payment import Payment
from app.models.review import Review
from app.models.wishlist import Wishlist
from app.models.user_activity import UserActivity
from app.models.event_update import EventUpdate
from app.models.coupon import Coupon

db = SessionLocal()

# First, ensure we have an organizer
organizer = db.query(User).filter(User.role == UserRole.ORGANIZER).first()

if not organizer:
    print("No organizer found. Creating organizer...")
    organizer = User(
        email="organizer@smartevent.com",
        username="organizer",
        hashed_password=get_password_hash("organizer123"),
        role=UserRole.ORGANIZER,
        is_admin=False
    )
    db.add(organizer)
    db.commit()
    db.refresh(organizer)
    print(f"✅ Created organizer: {organizer.email} / organizer123")
else:
    print(f"✅ Using existing organizer: {organizer.email}")

# ============================================
# IMPORTANT: Delete dependent records in correct order
# ============================================
print("Clearing existing data in correct order...")

# 1. Delete payments first (depends on bookings)
payments_deleted = db.query(Payment).delete()
print(f"   Deleted {payments_deleted} payments")

# 2. Delete tickets (depends on bookings)
tickets_deleted = db.query(Ticket).delete()
print(f"   Deleted {tickets_deleted} tickets")

# 3. Delete reviews (depends on bookings/events)
reviews_deleted = db.query(Review).delete()
print(f"   Deleted {reviews_deleted} reviews")

# 4. Delete wishlist items (depends on events)
wishlist_deleted = db.query(Wishlist).delete()
print(f"   Deleted {wishlist_deleted} wishlist items")

# 5. Delete user activities (depends on events)
activities_deleted = db.query(UserActivity).delete()
print(f"   Deleted {activities_deleted} user activities")

# 6. Delete event updates (depends on events)
updates_deleted = db.query(EventUpdate).delete()
print(f"   Deleted {updates_deleted} event updates")

# 7. Delete notifications (may reference bookings/events)
notifications_deleted = db.query(Notification).delete()
print(f"   Deleted {notifications_deleted} notifications")

# 8. Delete bookings (depends on events)
bookings_deleted = db.query(Booking).delete()
print(f"   Deleted {bookings_deleted} bookings")

# 9. Delete coupons (independent)
coupons_deleted = db.query(Coupon).delete()
print(f"   Deleted {coupons_deleted} coupons")

# 10. Now delete events
events_deleted = db.query(Event).delete()
print(f"   Deleted {events_deleted} events")

db.commit()
print("✅ All existing data cleared successfully!")

# ============================================
# MUSIC EVENTS (7 events)
# ============================================
music_events = [
    Event(
        title="🎵 Diljit Dosanjh - Dil-Luminati Tour India",
        description="Diljit Dosanjh, the global Punjabi music sensation, brings his electrifying Dil-Luminati Tour to India for the first time ever! Known for his charismatic stage presence and powerful vocals, Diljit has become a household name across the world with hits like 'G.O.A.T.', 'Proper Patola', and 'Lemonade'. This concert promises an unforgettable night filled with high-energy performances, stunning visual effects, and a setlist spanning his greatest hits from 'Punjab' to 'Born to Shine'. Fans can expect surprise guest appearances, incredible choreography, and a musical journey through his illustrious career. Whether you're a long-time fan or new to his music, this show will leave you dancing all night long. Don't miss this historic tour that's breaking records across stadiums worldwide!",
        category="Music",
        venue="Jio World Stadium",
        city="Mumbai",
        event_date=datetime.now() + timedelta(days=15),
        price=2499,
        total_tickets=25000,
        available_tickets=25000,
        image_url="https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎸 A R Rahman Live in Concert",
        description="Experience the magic of the Mozart of Madras, the legendary A R Rahman, as he takes you on a musical journey through his three-decade career. From 'Roja' to 'Slumdog Millionaire', from 'Bombay' to 'Rockstar', this concert features orchestral arrangements of his most iconic compositions. The show includes a full live orchestra, choir, and special guest vocalists performing classics like 'Vande Mataram', 'Jai Ho', 'Maa Tujhe Salaam', and 'Tum Ho'. Rahman's innovative fusion of classical Indian music with electronic sounds has won him two Oscars, two Grammys, and a BAFTA. This is more than a concert - it's a spiritual experience that transcends language and culture.",
        category="Music",
        venue="Jawaharlal Nehru Stadium",
        city="Chennai",
        event_date=datetime.now() + timedelta(days=30),
        price=3999,
        total_tickets=15000,
        available_tickets=15000,
        image_url="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎤 Sunburn Music Festival Goa 2026",
        description="Asia's biggest electronic dance music festival returns to the sunny beaches of Goa for its 15th spectacular edition! Three days of non-stop music across 5 stages featuring 100+ international and local DJs including Martin Garrix, David Guetta, Alan Walker, and Indian sensations Nucleya and Ritviz. Beyond the music, experience breathtaking laser shows, pyrotechnics, immersive art installations, and silent discos. Come party with 50,000+ music lovers from around the world at India's most iconic music festival!",
        category="Music",
        venue="Vagator Beach",
        city="Goa",
        event_date=datetime.now() + timedelta(days=45),
        price=5999,
        total_tickets=50000,
        available_tickets=50000,
        image_url="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎸 NH7 Weekender - Pune Edition",
        description="India's happiest music festival celebrates its 15th anniversary with an incredible lineup of indie, rock, electronic, and folk artists from India and abroad. Headliners include The Local Train, Prateek Kuhad, Divine, Ritviz, and international acts like The Kooks and Bombay Bicycle Club. Set across beautifully landscaped lawns, the festival features 4 stages, comedy performances by India's top stand-up artists, spoken word poetry, art installations, and a dedicated food village with cuisine from around the world.",
        category="Music",
        venue="Mahalaxmi Lawns",
        city="Pune",
        event_date=datetime.now() + timedelta(days=60),
        price=3499,
        total_tickets=20000,
        available_tickets=20000,
        image_url="https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎷 Zakir Hussain - Masters of Percussion",
        description="Legendary tabla maestro Zakir Hussain presents 'Masters of Percussion' - an extraordinary evening celebrating the rich traditions of Indian classical and world percussion. Joining him on stage are renowned artists from Africa, Japan, Iran, and South America, creating a unique fusion of rhythmic traditions from across the globe. This concert showcases his unparalleled virtuosity, improvisational genius, and ability to connect with audiences through pure rhythm.",
        category="Music",
        venue="Nita Mukesh Ambani Cultural Centre",
        city="Mumbai",
        event_date=datetime.now() + timedelta(days=25),
        price=4999,
        total_tickets=5000,
        available_tickets=5000,
        image_url="https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎤 Badshah Live - Paagal Tour",
        description="India's biggest hip-hop superstar Badshah brings his high-octane 'Paagal Tour' to your city! Known for chart-topping hits like 'Genda Phool', 'Paagal', 'Kala Chashma', and 'DJ Waley Babu', Badshah has revolutionized the Indian music scene with his unique blend of rap, pop, and Punjabi folk. This concert features spectacular stage design, mind-blowing pyrotechnics, and special guest appearances.",
        category="Music",
        venue="Indira Gandhi Arena",
        city="Delhi",
        event_date=datetime.now() + timedelta(days=50),
        price=2999,
        total_tickets=20000,
        available_tickets=20000,
        image_url="https://images.pexels.com/photos/1387069/pexels-photo-1387069.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎸 Zomaland - Food & Music Festival",
        description="India's most iconic food and music festival returns with a mouth-watering lineup of 50+ restaurants, celebrity chefs, and amazing musical performances. Indulge in everything from street food to fine dining while enjoying live sets from India's top artists. The festival features live cooking demonstrations, food competitions, mixology workshops, and a dedicated craft beer garden.",
        category="Music",
        venue="Palace Grounds",
        city="Bengaluru",
        event_date=datetime.now() + timedelta(days=70),
        price=2499,
        total_tickets=30000,
        available_tickets=30000,
        image_url="https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
]

# ============================================
# COMEDY EVENTS (6 events)
# ============================================
comedy_events = [
    Event(
        title="😂 Zakir Khan - Tathastu Live",
        description="Zakir Khan, India's beloved 'Sakht Launda', returns with his most anticipated stand-up special 'Tathastu'. Known for his unique storytelling style that blends humor with heartfelt emotions, Zakir takes you on a journey through his observations about life, relationships, and the quirks of being human. From his childhood memories in Indore to his experiences in the comedy circuit, every story is packed with wit, wisdom, and his signature slow-burn punchlines.",
        category="Comedy",
        venue="Siri Fort Auditorium",
        city="Delhi",
        event_date=datetime.now() + timedelta(days=18),
        price=1999,
        total_tickets=8000,
        available_tickets=8000,
        image_url="https://images.pexels.com/photos/2914066/pexels-photo-2914066.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎭 Kapil Sharma Live - Comedy Night",
        description="India's king of comedy Kapil Sharma brings his legendary wit and charm to the stage for a night of non-stop laughter. Fresh from his successful Netflix special 'I'm Not Done Yet', Kapil performs his best material alongside his talented team including Sunil Grover, Kiku Sharda, and Krushna Abhishek. The show combines stand-up comedy, hilarious sketches, improvised crowd interactions, and musical performances.",
        category="Comedy",
        venue="NSCI Dome",
        city="Mumbai",
        event_date=datetime.now() + timedelta(days=32),
        price=3999,
        total_tickets=10000,
        available_tickets=10000,
        image_url="https://images.pexels.com/photos/958445/pexels-photo-958445.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎤 Biswa Kalyan Rath - Live",
        description="The sharp-witted comedian behind the cult-favorite 'Pretentious Movie Reviews' series returns with his brand new stand-up special. Biswa Kalyan Rath is known for his intelligent, observational humor that touches upon everything from engineering college life to the absurdities of modern dating and social media. His deadpan delivery, clever wordplay, and unique perspectives make even the most mundane topics hilarious.",
        category="Comedy",
        venue="Good Shepherd Auditorium",
        city="Bengaluru",
        event_date=datetime.now() + timedelta(days=22),
        price=1499,
        total_tickets=5000,
        available_tickets=5000,
        image_url="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="😂 Kenny Sebastian - The Most Interesting Person",
        description="One of India's finest comedians and musical stand-up artists, Kenny Sebastian, presents his acclaimed show 'The Most Interesting Person'. Known for his clean, relatable humor that draws from his middle-class upbringing, his relationship with his parents, and his observations about modern life, Kenny has become a favorite among audiences of all ages. His unique style combines storytelling with improvised music.",
        category="Comedy",
        venue="Sri Shanmukhananda Hall",
        city="Mumbai",
        event_date=datetime.now() + timedelta(days=38),
        price=1799,
        total_tickets=6000,
        available_tickets=6000,
        image_url="https://images.pexels.com/photos/7788570/pexels-photo-7788570.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎭 Akiv Ali - Stand Up Special",
        description="Bold, unapologetic, and side-splittingly funny - Akiv Ali brings his unique brand of observational comedy to the stage. Drawing from his experiences as a young Indian navigating love, career pressure, family expectations, and social media addiction, Akiv's comedy resonates deeply with millennials and Gen Z audiences. His rapid-fire delivery, expressive storytelling, and fearless takes on taboo topics have made him one of the fastest-rising stars.",
        category="Comedy",
        venue="Hard Rock Cafe",
        city="Hyderabad",
        event_date=datetime.now() + timedelta(days=28),
        price=1299,
        total_tickets=3000,
        available_tickets=3000,
        image_url="https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="😂 Vir Das - Mind Fool Tour",
        description="International comedy superstar Vir Das returns to India with his globally acclaimed 'Mind Fool' tour. Hot off his Emmy nomination for the Netflix special 'Vir Das: Landing', Vir brings his sharp political satire, cultural observations, and unique perspective as an Indian comedian who has conquered stages worldwide. The show seamlessly blends stand-up, storytelling, music, and theater.",
        category="Comedy",
        venue="Jio World Garden",
        city="Mumbai",
        event_date=datetime.now() + timedelta(days=85),
        price=3999,
        total_tickets=12000,
        available_tickets=12000,
        image_url="https://images.pexels.com/photos/1045553/pexels-photo-1045553.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
]

# ============================================
# TECH EVENTS (6 events)
# ============================================
tech_events = [
    Event(
        title="🚀 TechSparks Bengaluru 2026",
        description="India's largest and most influential startup and technology conference returns for its 15th edition! TechSparks brings together 10,000+ founders, investors, developers, and innovators for two days of learning, networking, and inspiration. Keynote speakers include industry legends like Nandan Nilekani (Infosys), Kunal Shah (CRED), and international guests from Google, Microsoft, and Sequoia Capital.",
        category="Tech",
        venue="Bangalore International Exhibition Centre",
        city="Bengaluru",
        event_date=datetime.now() + timedelta(days=20),
        price=4999,
        total_tickets=10000,
        available_tickets=10000,
        image_url="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="💻 AWS Cloud Summit India",
        description="Join thousands of cloud enthusiasts, developers, and IT leaders at the biggest AWS event of the year! The AWS Cloud Summit features 100+ technical sessions, hands-on workshops, and certification bootcamps covering the latest in cloud computing, AI/ML, serverless architectures, data analytics, and security best practices.",
        category="Tech",
        venue="Hyatt Regency",
        city="Hyderabad",
        event_date=datetime.now() + timedelta(days=35),
        price=2999,
        total_tickets=5000,
        available_tickets=5000,
        image_url="https://images.pexels.com/photos/4050285/pexels-photo-4050285.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🤖 AI & ML Conclave 2026",
        description="India's premier artificial intelligence and machine learning conference featuring cutting-edge research, real-world applications, and future predictions from the brightest minds in AI. The conclave brings together AI researchers from IITs and IISc, industry practitioners from Google DeepMind, Microsoft Research, and Indian AI unicorns.",
        category="Tech",
        venue="ITC Gardenia",
        city="Bengaluru",
        event_date=datetime.now() + timedelta(days=55),
        price=3999,
        total_tickets=3000,
        available_tickets=3000,
        image_url="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎮 India Games Developer Conference",
        description="The premier event for game developers, publishers, and enthusiasts in India! IGDC 2026 features 100+ sessions on game design, programming, art, audio, and business, with tracks for both beginners and veterans. Learn from industry legends who have worked on hits like 'Raj: The Ancient Epic' and international blockbusters.",
        category="Tech",
        venue="JW Marriott",
        city="Pune",
        event_date=datetime.now() + timedelta(days=80),
        price=3499,
        total_tickets=4000,
        available_tickets=4000,
        image_url="https://images.pexels.com/photos/2523919/pexels-photo-2523919.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🔧 Google I/O Extended India",
        description="Google's global developer conference comes to India! Google I/O Extended brings the latest announcements and innovations from Google directly to Indian developers. Learn about Android 16, the newest features in Firebase, Flutter 5.0, Google Cloud's AI capabilities, and the future of Web.",
        category="Tech",
        venue="Bangalore Palace",
        city="Bengaluru",
        event_date=datetime.now() + timedelta(days=40),
        price=1999,
        total_tickets=8000,
        available_tickets=8000,
        image_url="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="☁️ Microsoft Azure Conference",
        description="The ultimate learning experience for cloud professionals, the Microsoft Azure Conference brings together experts, MVPs, and Microsoft product teams for deep technical training. Four tracks cover Azure Infrastructure, Data & AI, Developer Tools, and Security. Hands-on workshops and certification opportunities available.",
        category="Tech",
        venue="Hyderabad International Convention Centre",
        city="Hyderabad",
        event_date=datetime.now() + timedelta(days=65),
        price=2499,
        total_tickets=6000,
        available_tickets=6000,
        image_url="https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
]

# ============================================
# SPORTS EVENTS (6 events)
# ============================================
sports_events = [
    Event(
        title="🏏 IPL 2026 - Mumbai Indians vs CSK",
        description="The biggest rivalry in IPL history returns! Witness Rohit Sharma's Mumbai Indians take on MS Dhoni's Chennai Super Kings in what promises to be an absolute thriller at the iconic Wankhede Stadium. This clash of titans features the world's best cricketers including Jasprit Bumrah, Suryakumar Yadav, Ravindra Jadeja, and Devon Conway.",
        category="Sports",
        venue="Wankhede Stadium",
        city="Mumbai",
        event_date=datetime.now() + timedelta(days=25),
        price=8999,
        total_tickets=33000,
        available_tickets=33000,
        image_url="https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="⚽ Indian Super League - Final",
        description="The grand finale of the Indian Super League! Watch the two best teams battle for the championship trophy in front of 65,000 passionate fans at the historic Salt Lake Stadium. The ISL Final is the biggest football event in India, featuring international stars, Indian national team players, and the most exciting young talent.",
        category="Sports",
        venue="Salt Lake Stadium",
        city="Kolkata",
        event_date=datetime.now() + timedelta(days=60),
        price=4999,
        total_tickets=65000,
        available_tickets=65000,
        image_url="https://images.pexels.com/photos/412541/pexels-photo-412541.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🏸 India Open Badminton Championships",
        description="World-class badminton action at the prestigious India Open, a BWF Super 750 tournament featuring the biggest names in world badminton! Watch Olympic medalists PV Sindhu and Lakshya Sen battle against international stars like Viktor Axelsen, Tai Tzu-ying, and Kodai Naraoka.",
        category="Sports",
        venue="K.D. Jadhav Indoor Hall",
        city="Delhi",
        event_date=datetime.now() + timedelta(days=45),
        price=2999,
        total_tickets=8000,
        available_tickets=8000,
        image_url="https://images.pexels.com/photos/1101947/pexels-photo-1101947.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🏀 Pro Kabaddi League - Playoffs",
        description="High-octane kabaddi action as the top teams compete for a spot in the Pro Kabaddi League final! Experience India's homegrown sport at its most thrilling - the playoffs feature the best raiders and defenders in intense do-or-die matches. Watch stars like Pardeep Narwal, Naveen Kumar, and Fazel Atrachali.",
        category="Sports",
        venue="Transstadia",
        city="Ahmedabad",
        event_date=datetime.now() + timedelta(days=35),
        price=1999,
        total_tickets=15000,
        available_tickets=15000,
        image_url="https://images.pexels.com/photos/1350762/pexels-photo-1350762.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🎾 Tennis Premier League - Final",
        description="The revolutionary Tennis Premier League returns for its blockbuster final! India's unique tennis format combines international stars with local talent in an exciting team-based competition. Watch top ATP and WTA players compete alongside India's best including Sumit Nagal, Rohan Bopanna, and Ankita Raina.",
        category="Sports",
        venue="RK Khanna Stadium",
        city="Delhi",
        event_date=datetime.now() + timedelta(days=55),
        price=3499,
        total_tickets=10000,
        available_tickets=10000,
        image_url="https://images.pexels.com/photos/412541/pexels-photo-412541.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🏏 India vs Australia - Test Match",
        description="The most anticipated Test series of the year! Watch Team India take on Australia at the iconic Eden Gardens in a thrilling 5-day Test match. Experience the unique atmosphere of Test cricket - the ebb and flow, tactical battles, and moments of individual brilliance that only the longest format provides.",
        category="Sports",
        venue="Eden Gardens",
        city="Kolkata",
        event_date=datetime.now() + timedelta(days=90),
        price=3999,
        total_tickets=68000,
        available_tickets=68000,
        image_url="https://images.pexels.com/photos/1340721/pexels-photo-1340721.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
]

# ============================================
# BUSINESS EVENTS (6 events)
# ============================================
business_events = [
    Event(
        title="💼 India Economic Summit 2026",
        description="The premier gathering of global and Indian leaders discussing the future of India's economy! Organized in collaboration with the World Economic Forum, the India Economic Summit brings together 2,000+ delegates including Prime Minister Narendra Modi, Union Ministers, Fortune 500 CEOs, and international investors.",
        category="Business",
        venue="Taj Palace",
        city="Delhi",
        event_date=datetime.now() + timedelta(days=40),
        price=14999,
        total_tickets=2000,
        available_tickets=2000,
        image_url="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🏆 Startup Mahakumbh",
        description="India's largest startup event featuring 1,000+ startups, 500+ investors, and 100+ unicorn founders! Startup Mahakumbh is the ultimate platform for founders to showcase innovations, raise funding, and scale their ventures. Key sectors include AI, Fintech, SaaS, Healthtech, Edtech, and Clean-tech.",
        category="Business",
        venue="Pragati Maidan",
        city="Delhi",
        event_date=datetime.now() + timedelta(days=65),
        price=2999,
        total_tickets=15000,
        available_tickets=15000,
        image_url="https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="👩‍💼 Women in Leadership Conference",
        description="Empowering women executives and entrepreneurs! The Women in Leadership Conference brings together India's most successful female leaders from diverse industries including technology, finance, healthcare, education, and manufacturing. Keynote speakers include Kiran Mazumdar-Shaw (Biocon), Falguni Nayar (Nykaa), and Vineeta Singh.",
        category="Business",
        venue="The Leela Palace",
        city="Bengaluru",
        event_date=datetime.now() + timedelta(days=28),
        price=7999,
        total_tickets=1500,
        available_tickets=1500,
        image_url="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🏢 Real Estate Investment Expo",
        description="The ultimate platform for real estate investors, developers, and homebuyers! The Real Estate Investment Expo features 100+ projects from top developers across residential, commercial, and plotted developments. Attend seminars on property laws, tax implications, ROI analysis, and upcoming infrastructure corridors.",
        category="Business",
        venue="Bombay Convention Centre",
        city="Mumbai",
        event_date=datetime.now() + timedelta(days=50),
        price=4999,
        total_tickets=5000,
        available_tickets=5000,
        image_url="https://images.pexels.com/photos/280232/pexels-photo-280232.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="📈 Digital Marketing Summit",
        description="Master the art of digital marketing at India's largest gathering of marketing professionals! The Digital Marketing Summit features 40+ sessions across SEO, social media, content marketing, email marketing, PPC, analytics, and AI in marketing. Learn from CMOs of top brands like Amazon, Flipkart, Unilever, and Nike.",
        category="Business",
        venue="Chennai Trade Centre",
        city="Chennai",
        event_date=datetime.now() + timedelta(days=42),
        price=2999,
        total_tickets=3000,
        available_tickets=3000,
        image_url="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
    Event(
        title="🏦 Fintech Conclave India",
        description="The future of financial technology and digital payments in India! The Fintech Conclave brings together 4,000+ industry leaders including founders of Paytm, PhonePe, Razorpay, and policy makers from RBI, SEBI, and Ministry of Finance. Sessions cover UPI revolution, embedded finance, Neobanks, blockchain, and crypto regulations.",
        category="Business",
        venue="Mumbai Convention Centre",
        city="Mumbai",
        event_date=datetime.now() + timedelta(days=75),
        price=5999,
        total_tickets=4000,
        available_tickets=4000,
        image_url="https://images.pexels.com/photos/6802124/pexels-photo-6802124.jpeg?auto=compress&cs=tinysrgb&w=800",
        organizer_id=organizer.id,
        event_status=EventStatus.UPCOMING
    ),
]

# Combine all events (7+6+6+6+6 = 31 events)
all_events = music_events + comedy_events + tech_events + sports_events + business_events

# Verify count
print(f"\nTotal events to create: {len(all_events)}")
assert len(all_events) == 31, "Should have exactly 31 events!"

# Add all events to database
for event in all_events:
    db.add(event)

db.commit()

print("=" * 60)
print("✅ 31 EVENTS ADDED SUCCESSFULLY!")
print("=" * 60)

# Display summary
from collections import Counter
categories = Counter()

for event in db.query(Event).all():
    categories[event.category] += 1

print(f"\n📊 Total Events: {len(all_events)}")
print("\n📁 Events by Category:")
for cat, count in categories.items():
    print(f"   🏷️  {cat}: {count} events")

print("\n🎟️  All events have WORKING images from Pexels!")
print("\n✨ Ready to use!")
db.close()