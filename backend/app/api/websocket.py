from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.websocket_manager import manager
from app.services.auth_service import AuthService

async def websocket_endpoint(
    websocket: WebSocket,
    token: str = None,
    event_id: int = None,
    db: Session = Depends(get_db)
):
    user = None
    if token:
        auth_service = AuthService(db)
        try:
            user = auth_service.get_current_user(token)
        except:
            pass
    
    await manager.connect(websocket, user.id if user else None)
    
    if event_id:
        await manager.subscribe_to_event(websocket, event_id)
        
        # Send initial availability
        from app.services.seat_availability_service import SeatAvailabilityService
        availability_service = SeatAvailabilityService(db)
        availability = availability_service.get_event_availability(event_id)
        
        await websocket.send_json({
            "type": "initial_availability",
            "event_id": event_id,
            "data": availability
        })
    
    try:
        while True:
            data = await websocket.receive_text()
            # Handle client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id if user else None)
        if event_id:
            await manager.unsubscribe_from_event(websocket, event_id)