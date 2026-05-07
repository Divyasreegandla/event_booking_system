from sqlalchemy.orm import Session
from app.models.translation import Translation
from typing import Dict


class TranslationService:
    # Default translations for UI elements
    DEFAULT_TRANSLATIONS = {
        "en": {
            "welcome": "Welcome",
            "book_now": "Book Now",
            "my_bookings": "My Bookings",
            "my_tickets": "My Tickets",
            "profile": "Profile",
            "logout": "Logout",
            "search_events": "Search events...",
            "all_events": "All Events",
            "no_events": "No events found",
            "tickets_available": "Tickets Available",
            "price": "Price",
            "date": "Date",
            "venue": "Venue",
            "city": "City",
            "category": "Category",
            "description": "Description",
            "reviews": "Reviews",
            "write_review": "Write a Review",
            "rating": "Rating",
            "submit": "Submit",
            "cancel": "Cancel",
            "confirm": "Confirm",
            "payment": "Payment",
            "checkout": "Checkout",
            "order_summary": "Order Summary",
            "total": "Total",
            "discount": "Discount",
            "apply_coupon": "Apply Coupon",
            "points": "Points",
            "referral_code": "Referral Code",
            "dark_mode": "Dark Mode",
            "light_mode": "Light Mode"
        },
        "hi": {
            "welcome": "स्वागत है",
            "book_now": "अभी बुक करें",
            "my_bookings": "मेरी बुकिंग",
            "my_tickets": "मेरे टिकट",
            "profile": "प्रोफाइल",
            "logout": "लॉग आउट",
            "search_events": "इवेंट खोजें...",
            "all_events": "सभी इवेंट",
            "no_events": "कोई इवेंट नहीं मिला",
            "tickets_available": "टिकट उपलब्ध",
            "price": "कीमत",
            "date": "तारीख",
            "venue": "स्थान",
            "city": "शहर",
            "category": "श्रेणी",
            "description": "विवरण",
            "reviews": "समीक्षाएं",
            "write_review": "समीक्षा लिखें",
            "rating": "रेटिंग",
            "submit": "जमा करें",
            "cancel": "रद्द करें",
            "confirm": "पुष्टि करें",
            "payment": "भुगतान",
            "checkout": "चेकआउट",
            "order_summary": "ऑर्डर सारांश",
            "total": "कुल",
            "discount": "छूट",
            "apply_coupon": "कूपन लागू करें"
        }
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_translations(self, language_code: str = "en") -> Dict[str, str]:
        """Get all translations for a language"""
        # Start with defaults
        translations = self.DEFAULT_TRANSLATIONS.get(language_code, self.DEFAULT_TRANSLATIONS["en"]).copy()
        
        # Override with database translations if any
        db_translations = self.db.query(Translation).filter(
            Translation.language_code == language_code
        ).all()
        
        for t in db_translations:
            translations[t.key] = t.value
        
        return translations
    
    def get_supported_languages(self) -> list:
        """Get list of supported languages"""
        return [
            {"code": "en", "name": "English", "flag": "🇬🇧"},
            {"code": "hi", "name": "हिन्दी", "flag": "🇮🇳"}
        ]