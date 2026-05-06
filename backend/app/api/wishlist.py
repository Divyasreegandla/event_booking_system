from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.dependencies.roles import get_current_user
from app.models.user import User
from app.models.wishlist import Wishlist
from app.models.event import Event
from app.schemas.wishlist import AddToWishlistRequest, WishlistItemResponse, WishlistResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter()


@router.get("/", response_model=WishlistResponse)
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's wishlist"""
    wishlist_items = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id
    ).all()
    
    items = []
    for item in wishlist_items:
        event = db.query(Event).filter(Event.id == item.event_id).first()
        if event:
            items.append({
                "id": item.id,
                "event_id": event.id,
                "event_title": event.title,
                "event_category": event.category,
                "event_date": event.event_date,
                "event_price": event.price,
                "event_image_url": event.image_url,
                "event_city": event.city,
                "created_at": item.created_at
            })
    
    return {"items": items, "total": len(items)}


@router.post("/")
async def add_to_wishlist(
    request: AddToWishlistRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an event to wishlist"""
    # Check if event exists
    event = db.query(Event).filter(Event.id == request.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already in wishlist
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.event_id == request.event_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Event already in wishlist")
    
    # Add to wishlist
    wishlist_item = Wishlist(
        user_id=current_user.id,
        event_id=request.event_id
    )
    db.add(wishlist_item)
    
    # Track activity for recommendations
    recommendation_service = RecommendationService(db)
    recommendation_service.track_user_activity(current_user.id, request.event_id, "wishlist")
    
    db.commit()
    
    return {"message": "Event added to wishlist", "wishlist_id": wishlist_item.id}


@router.delete("/{event_id}")
async def remove_from_wishlist(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an event from wishlist"""
    wishlist_item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.event_id == event_id
    ).first()
    
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Event not in wishlist")
    
    db.delete(wishlist_item)
    db.commit()
    
    return {"message": "Event removed from wishlist"}


@router.get("/check/{event_id}")
async def check_in_wishlist(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if an event is in user's wishlist"""
    wishlist_item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.event_id == event_id
    ).first()
    
    return {"in_wishlist": wishlist_item is not None}