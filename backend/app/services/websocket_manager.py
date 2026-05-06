from typing import Dict, Set, List
from fastapi import WebSocket
import asyncio
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.event_subscribers: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int = None):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int = None):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def subscribe_to_event(self, websocket: WebSocket, event_id: int):
        if event_id not in self.event_subscribers:
            self.event_subscribers[event_id] = []
        self.event_subscribers[event_id].append(websocket)
    
    async def unsubscribe_from_event(self, websocket: WebSocket, event_id: int):
        if event_id in self.event_subscribers:
            if websocket in self.event_subscribers[event_id]:
                self.event_subscribers[event_id].remove(websocket)
    
    async def broadcast_event_update(self, event_id: int, data: dict):
        if event_id in self.event_subscribers:
            disconnected = []
            for websocket in self.event_subscribers[event_id]:
                try:
                    await websocket.send_json(data)
                except:
                    disconnected.append(websocket)
            
            for ws in disconnected:
                await self.unsubscribe_from_event(ws, event_id)
    
    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_json({"type": "personal", "message": message})
                except:
                    pass

manager = ConnectionManager()