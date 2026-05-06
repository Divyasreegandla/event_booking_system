from sqlalchemy.orm import Session
from datetime import datetime
import re

class ChatbotService:
    def __init__(self, db: Session):
        self.db = db
    
    def process_message(self, message: str, user_id: int = None) -> dict:
        """Process user message and return appropriate response"""
        message_lower = message.lower().strip()
        
        # Define intents
        intents = [
            ("booking|my bookings|my tickets", self._handle_my_bookings),
            ("find events|search events|show events", self._handle_find_events),
            ("recommend|suggest|recommended for me", self._handle_recommendations),
            ("trending|popular events", self._handle_trending),
            ("wishlist|saved events|bookmarks", self._handle_wishlist),
            ("profile|my profile|account", self._handle_profile),
            ("cancel booking|cancel", self._handle_cancel_booking),
            ("help|what can you do|support", self._handle_help),
            ("event near me|events in|local events", self._handle_location_events),
            ("this weekend|weekend events", self._handle_weekend_events),
            ("cheap events|affordable|budget", self._handle_budget_events),
            ("free events", self._handle_free_events),
        ]
        
        for pattern, handler in intents:
            if re.search(pattern, message_lower):
                return handler(message_lower, user_id)
        
        return self._handle_fallback()
    
    def _handle_my_bookings(self, message: str, user_id: int) -> dict:
        from app.models.booking import Booking, BookingStatus
        from app.models.event import Event
        
        if not user_id:
            return {
                "reply": "Please log in to view your bookings. Would you like me to help you log in?",
                "intent": "login_required",
                "quick_replies": ["Go to Login", "Create Account", "Back to Home"]
            }
        
        bookings = self.db.query(Booking).filter(
            Booking.user_id == user_id,
            Booking.status == BookingStatus.CONFIRMED
        ).order_by(Booking.created_at.desc()).limit(5).all()
        
        if not bookings:
            return {
                "reply": "You don't have any bookings yet. Would you like to browse some events?",
                "intent": "no_bookings",
                "quick_replies": ["Browse Events", "Trending Events", "Help"],
                "data": {"bookings": []}
            }
        
        booking_list = []
        for booking in bookings:
            event = self.db.query(Event).filter(Event.id == booking.event_id).first()
            booking_list.append({
                "reference": booking.booking_reference,
                "event_title": event.title if event else "Unknown",
                "date": event.event_date.isoformat() if event else None,
                "quantity": booking.quantity,
                "amount": booking.total_price
            })
        
        reply = f"You have {len(bookings)} confirmed bookings. Here are your recent ones:\n"
        for b in booking_list[:3]:
            reply += f"• {b['event_title']} - {b['quantity']} ticket(s)\n"
        reply += "\nTap 'My Bookings' to see all your bookings."
        
        return {
            "reply": reply,
            "intent": "my_bookings",
            "quick_replies": ["View My Bookings", "View Tickets", "Browse Events"],
            "data": {"bookings": booking_list}
        }
    
    def _handle_find_events(self, message: str, user_id: int) -> dict:
        from app.models.event import Event, EventStatus
        from datetime import datetime
        
        # Extract category
        categories = ["music", "tech", "sports", "business", "comedy"]
        detected_category = None
        for cat in categories:
            if cat in message:
                detected_category = cat.title()
                break
        
        query = self.db.query(Event).filter(
            Event.is_active == True,
            Event.event_status == EventStatus.UPCOMING,
            Event.event_date > datetime.now()
        )
        
        if detected_category:
            query = query.filter(Event.category == detected_category)
        
        events = query.limit(5).all()
        
        if not events:
            return {
                "reply": "No events found matching your criteria. Try a different search or browse all events.",
                "intent": "no_events",
                "quick_replies": ["Browse All Events", "Trending Events", "Help"]
            }
        
        reply = f"Here are some events"
        if detected_category:
            reply += f" in {detected_category}"
        reply += ":\n"
        
        for event in events:
            reply += f"🎫 {event.title} - ₹{event.price} - {event.city}\n"
        reply += "\nTap 'Browse Events' to see more details."
        
        return {
            "reply": reply,
            "intent": "find_events",
            "quick_replies": ["Browse Events", "Filter by Category", "Trending"],
            "data": {"events": [{"id": e.id, "title": e.title, "price": e.price} for e in events]}
        }
    
    def _handle_recommendations(self, message: str, user_id: int) -> dict:
        if not user_id:
            return {
                "reply": "Please log in to get personalized recommendations.",
                "intent": "login_required",
                "quick_replies": ["Go to Login", "Browse Trending Events"]
            }
        
        from app.services.recommendation_service import RecommendationService
        rec_service = RecommendationService(self.db)
        recommendations = rec_service.get_personalized_recommendations(user_id, 5)
        
        if not recommendations:
            return {
                "reply": "We don't have enough data yet to personalize recommendations. Check out trending events!",
                "intent": "no_recommendations",
                "quick_replies": ["Trending Events", "Browse All Events"]
            }
        
        reply = "Based on your interests, we recommend:\n"
        for rec in recommendations[:3]:
            reply += f"🎫 {rec['title']} - ₹{rec['price']} - {rec['city']}\n"
        reply += "\nTap 'View Recommendations' to see more."
        
        return {
            "reply": reply,
            "intent": "recommendations",
            "quick_replies": ["View Recommendations", "Trending Events", "Browse Events"],
            "data": {"recommendations": recommendations}
        }
    
    def _handle_trending(self, message: str, user_id: int) -> dict:
        from app.services.recommendation_service import RecommendationService
        rec_service = RecommendationService(self.db)
        trending = rec_service.get_trending_events(5)
        
        if not trending:
            return {
                "reply": "No trending events at the moment. Check back later!",
                "intent": "no_trending",
                "quick_replies": ["Browse All Events", "Help"]
            }
        
        reply = "🔥 Trending Events right now:\n"
        for event in trending[:3]:
            reply += f"🎫 {event['title']} - ₹{event['price']} - {event['city']}\n"
        reply += "\nTap 'View Trending' to see all."
        
        return {
            "reply": reply,
            "intent": "trending",
            "quick_replies": ["View Trending", "View Recommendations", "Browse Events"],
            "data": {"trending": trending}
        }
    
    def _handle_wishlist(self, message: str, user_id: int) -> dict:
        if not user_id:
            return {
                "reply": "Please log in to view your wishlist.",
                "intent": "login_required",
                "quick_replies": ["Go to Login", "Browse Events"]
            }
        
        from app.models.wishlist import Wishlist
        from app.models.event import Event
        
        wishlist_items = self.db.query(Wishlist).filter(Wishlist.user_id == user_id).limit(5).all()
        
        if not wishlist_items:
            return {
                "reply": "Your wishlist is empty. Save events you like and they'll appear here!",
                "intent": "empty_wishlist",
                "quick_replies": ["Browse Events", "Trending Events"]
            }
        
        reply = f"You have {len(wishlist_items)} saved events:\n"
        for item in wishlist_items[:3]:
            event = self.db.query(Event).filter(Event.id == item.event_id).first()
            if event:
                reply += f"🎫 {event.title}\n"
        reply += "\nTap 'View Wishlist' to see all your saved events."
        
        return {
            "reply": reply,
            "intent": "wishlist",
            "quick_replies": ["View Wishlist", "Browse Events", "Recommendations"],
            "data": {"count": len(wishlist_items)}
        }
    
    def _handle_profile(self, message: str, user_id: int) -> dict:
        if not user_id:
            return {
                "reply": "Please log in to view your profile.",
                "intent": "login_required",
                "quick_replies": ["Go to Login", "Help"]
            }
        
        from app.models.user import User
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return {
                "reply": "User not found. Please try logging in again.",
                "intent": "error",
                "quick_replies": ["Go to Login", "Help"]
            }
        
        return {
            "reply": f"👤 {user.username}\n📧 {user.email}\n\nTap 'View Profile' to see your full profile and edit your details.",
            "intent": "profile",
            "quick_replies": ["View Profile", "My Bookings", "Wishlist"]
        }
    
    def _handle_cancel_booking(self, message: str, user_id: int) -> dict:
        if not user_id:
            return {
                "reply": "Please log in to cancel a booking.",
                "intent": "login_required",
                "quick_replies": ["Go to Login", "Help"]
            }
        
        return {
            "reply": "To cancel a booking, please go to 'My Bookings' and click the 'Cancel' button next to the booking you want to cancel.\n\nNote: Only confirmed bookings can be cancelled.",
            "intent": "cancel_booking",
            "quick_replies": ["Go to My Bookings", "Help"]
        }
    
    def _handle_help(self, message: str, user_id: int) -> dict:
        return {
            "reply": "I can help you with:\n\n🔍 Find events (try 'find music events')\n📋 View my bookings\n⭐ Get recommendations\n📌 Manage wishlist\n👤 View profile\n❌ Cancel bookings\n📍 Find events near you\n📅 Weekend events\n💰 Budget events\n\nWhat would you like help with?",
            "intent": "help",
            "quick_replies": ["Find Events", "My Bookings", "Recommendations", "Trending Events"]
        }
    
    def _handle_location_events(self, message: str, user_id: int) -> dict:
        # Extract city from message
        from app.models.event import Event, EventStatus
        from datetime import datetime
        
        cities = ["mumbai", "delhi", "bangalore", "chennai", "hyderabad", "pune", "kolkata", "goa", "ahmedabad"]
        detected_city = None
        for city in cities:
            if city in message:
                detected_city = city.title()
                break
        
        if not detected_city:
            return {
                "reply": "Which city are you looking for? (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Goa, Ahmedabad)",
                "intent": "ask_city",
                "quick_replies": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"]
            }
        
        query = self.db.query(Event).filter(
            Event.is_active == True,
            Event.event_status == EventStatus.UPCOMING,
            Event.city.ilike(f"%{detected_city}%"),
            Event.event_date > datetime.now()
        )
        
        events = query.limit(5).all()
        
        if not events:
            return {
                "reply": f"No events found in {detected_city}. Try a different city or browse all events.",
                "intent": "no_location_events",
                "quick_replies": ["Browse All Events", "Trending Events"]
            }
        
        reply = f"📍 Events in {detected_city}:\n"
        for event in events:
            reply += f"🎫 {event.title} - ₹{event.price} - {event.event_date.strftime('%b %d')}\n"
        reply += "\nTap 'Browse Events' to see more details."
        
        return {
            "reply": reply,
            "intent": "location_events",
            "quick_replies": ["Browse Events", "Change City"],
            "data": {"city": detected_city, "count": len(events)}
        }
    
    def _handle_weekend_events(self, message: str, user_id: int) -> dict:
        from app.models.event import Event, EventStatus
        from datetime import datetime, timedelta
        
        today = datetime.now()
        next_saturday = today + timedelta((5 - today.weekday()) % 7)
        next_sunday = next_saturday + timedelta(days=1)
        
        events = self.db.query(Event).filter(
            Event.is_active == True,
            Event.event_status == EventStatus.UPCOMING,
            Event.event_date >= next_saturday,
            Event.event_date <= next_sunday
        ).limit(5).all()
        
        if not events:
            return {
                "reply": "No events found for this weekend. Check out upcoming events!",
                "intent": "no_weekend_events",
                "quick_replies": ["Browse All Events", "Next Weekend"]
            }
        
        reply = f"📅 Events this weekend ({next_saturday.strftime('%b %d')} - {next_sunday.strftime('%b %d')}):\n"
        for event in events:
            reply += f"🎫 {event.title} - ₹{event.price} - {event.event_date.strftime('%a, %b %d')}\n"
        
        return {
            "reply": reply,
            "intent": "weekend_events",
            "quick_replies": ["Browse Events", "Find by City"],
            "data": {"count": len(events)}
        }
    
    def _handle_budget_events(self, message: str, user_id: int) -> dict:
        from app.models.event import Event, EventStatus
        from datetime import datetime
        
        # Extract numbers for budget
        import re
        numbers = re.findall(r'\d+', message)
        budget = int(numbers[0]) if numbers else 500
        
        events = self.db.query(Event).filter(
            Event.is_active == True,
            Event.event_status == EventStatus.UPCOMING,
            Event.price <= budget
        ).order_by(Event.price.asc()).limit(5).all()
        
        if not events:
            return {
                "reply": f"No events found under ₹{budget}. Try a higher budget or browse all events.",
                "intent": "no_budget_events",
                "quick_replies": ["Browse All Events", "Trending Events"]
            }
        
        reply = f"💰 Events under ₹{budget}:\n"
        for event in events:
            reply += f"🎫 {event.title} - ₹{event.price}\n"
        
        return {
            "reply": reply,
            "intent": "budget_events",
            "quick_replies": ["Browse Events", "Filter by Higher Budget"],
            "data": {"budget": budget, "count": len(events)}
        }
    
    def _handle_free_events(self, message: str, user_id: int) -> dict:
        from app.models.event import Event, EventStatus
        from datetime import datetime
        
        events = self.db.query(Event).filter(
            Event.is_active == True,
            Event.event_status == EventStatus.UPCOMING,
            Event.price == 0
        ).limit(5).all()
        
        if not events:
            return {
                "reply": "No free events found at the moment. Check back later!",
                "intent": "no_free_events",
                "quick_replies": ["Browse All Events", "Budget Events"]
            }
        
        reply = "🎟️ Free events:\n"
        for event in events:
            reply += f"🎫 {event.title} - {event.city}\n"
        
        return {
            "reply": reply,
            "intent": "free_events",
            "quick_replies": ["Browse Events", "Find by City"]
        }
    
    def _handle_fallback(self) -> dict:
        return {
            "reply": "I'm here to help! You can ask me to:\n\n• Find events (e.g., 'find music events in Mumbai')\n• Show your bookings\n• Recommend events for you\n• Show trending events\n• Help with cancellations\n\nWhat would you like to do?",
            "intent": "fallback",
            "quick_replies": ["Find Events", "My Bookings", "Recommendations", "Help"]
        }