from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class PlatformStatsResponse(BaseModel):
    total_users: int
    total_organizers: int
    total_events: int
    total_bookings: int
    total_tickets_sold: int
    total_revenue: float
    active_events: int
    completed_events: int

class DailySalesResponse(BaseModel):
    date: str
    tickets_sold: int
    revenue: float

class MonthlyTrendResponse(BaseModel):
    month: str
    bookings_count: int
    revenue: float

class PopularEventResponse(BaseModel):
    event_id: int
    title: str
    tickets_sold: int
    revenue: float

class OrganizerEventStats(BaseModel):
    event_id: int
    title: str
    event_date: datetime
    event_status: str
    total_tickets: int
    tickets_sold: int
    remaining_tickets: int
    total_revenue: float
    booking_count: int

class OrganizerDashboardStats(BaseModel):
    total_events: int
    total_tickets_sold: int
    total_revenue: float
    active_events: int
    upcoming_events: int
    events_by_status: dict