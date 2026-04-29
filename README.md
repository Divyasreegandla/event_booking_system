# 🎫 SmartEvent - Event Discovery & Ticket Booking System

A full-stack event booking platform that allows users to discover events, book tickets, and manage their bookings with QR code digital tickets and automated reminders.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### User Features
- 🔐 **Authentication** - Register, Login, JWT-based authentication
- 🎟️ **Event Discovery** - Browse events with category filters (Music, Tech, Sports, Business, Comedy)
- 🔍 **Search Events** - Search events by title or description
- 📅 **Booking System** - Book tickets with quantity selection
- 🎫 **QR Code Tickets** - Generate unique QR codes for each ticket
- 📧 **Email Notifications** - Booking confirmation and cancellation emails
- 🔔 **Event Reminders** - Automatic reminders for upcoming events
- 👤 **Booking History** - View all past and upcoming bookings
- ❌ **Cancel Bookings** - Cancel confirmed bookings
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

### Admin Features
- 📊 **Dashboard Statistics** - View total users, events, bookings, and revenue
- 📋 **Manage Bookings** - View all user bookings and update status
- ✅ **Ticket Verification** - Scan and verify QR tickets at event entry

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (can be switched to PostgreSQL)
- **ORM**: SQLAlchemy
- **Authentication**: JWT with bcrypt password hashing
- **QR Generation**: qrcode library
- **Email**: SMTP (configurable)

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: CSS3 with modern design
- **HTTP Client**: Axios
- **Routing**: React Router DOM v6
- **Notifications**: React Hot Toast
- **QR Display**: qrcode.react

## 📁 Project Structure
event_booking_system/
├── backend/
│ ├── app/
│ │ ├── api/
│ │ │ ├── auth.py # Authentication endpoints
│ │ │ ├── events.py # Event management endpoints
│ │ │ ├── bookings.py # Booking endpoints
│ │ │ ├── notifications.py # Notification endpoints
│ │ │ └── admin.py # Admin endpoints
│ │ ├── models/
│ │ │ ├── user.py
│ │ │ ├── event.py
│ │ │ ├── booking.py
│ │ │ ├── ticket.py
│ │ │ └── notification.py
│ │ ├── schemas/ # Pydantic models
│ │ ├── services/ # Business logic
│ │ ├── database/ # Database connection
│ │ └── utils/ # Helper functions
│ ├── requirements.txt
│ ├── init_db.py
│ ├── add_events.py
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Navbar.jsx
│ │ │ ├── EventCard.jsx
│ │ │ ├── Footer.jsx
│ │ │ ├── ProtectedRoute.jsx
│ │ │ ├── NotificationDropdown.jsx
│ │ │ └── QRScanner.jsx
│ │ ├── pages/
│ │ │ ├── Home.jsx
│ │ │ ├── Login.jsx
│ │ │ ├── Register.jsx
│ │ │ ├── EventDetails.jsx
│ │ │ ├── Booking.jsx
│ │ │ ├── BookingHistory.jsx
│ │ │ ├── Tickets.jsx
│ │ │ ├── Notifications.jsx
│ │ │ └── Contact.jsx
│ │ ├── context/
│ │ │ └── AuthContext.jsx
│ │ ├── services/
│ │ │ └── api.js
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── package.json
│ └── index.html
│
└── README.md

text

## 🚀 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm 

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
Create virtual environment:

bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
Install dependencies:

bash
pip install -r requirements.txt
Create .env file:

env
DATABASE_URL=sqlite:///./smartevent.db
SECRET_KEY=your-secret-key-change-this-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:3000
EMAIL_ENABLED=False
Initialize database:

bash
python init_db.py
Add sample events:

bash
python add_events.py
Frontend Setup
Navigate to frontend directory:

bash
cd frontend
Install dependencies:

bash
npm install
🏃 Running the Application
Start Backend Server
bash
cd backend
python -m uvicorn app.main:app --reload
Server runs at: http://localhost:8000

Start Frontend Server
bash
cd frontend
npm run dev
Application runs at: http://localhost:3000

Access API Documentation
Swagger UI: http://localhost:8000/docs

📚 API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/auth/me	Get current user
Events
Method	Endpoint	Description
GET	/api/events/	Get all events
GET	/api/events/{id}	Get event details
GET	/api/events/categories	Get event categories
Bookings
Method	Endpoint	Description
POST	/api/bookings/	Create booking
GET	/api/bookings/my-bookings	Get user bookings
DELETE	/api/bookings/{id}	Cancel booking
GET	/api/bookings/my-tickets	Get user tickets
POST	/api/bookings/verify-ticket/{code}	Verify ticket
Notifications
Method	Endpoint	Description
GET	/api/notifications/my-notifications	Get notifications
GET	/api/notifications/unread-count	Get unread count
POST	/api/notifications/{id}/read	Mark as read
POST	/api/notifications/mark-all-read	Mark all as read
Admin
Method	Endpoint	Description
GET	/api/admin/bookings/all	Get all bookings
PUT	/api/admin/bookings/{id}/status	Update booking status
GET	/api/admin/dashboard/stats	Get dashboard stats
🧪 Testing
Backend Testing (via Swagger)
Start backend server

Open http://localhost:8000/docs

Test endpoints directly from Swagger UI

Frontend Testing Flow
Register new account → /register

Login → /login

Browse events → Home page

Filter by category (Music/Tech/Sports/Business/Comedy)

View event details → Click on event card

Book tickets → Select quantity → Book Now

View booking history → /bookings

View QR tickets → /tickets

Download ticket → Click download button

Receive notifications → Check bell icon

Cancel booking → In booking history

Admin Testing
Login with admin credentials

Go to /admin/scan to verify tickets


This README.md file includes:

- ✅ Complete project overview
- ✅ Installation instructions
- ✅ Configuration guide
- ✅ Running instructions
- ✅ API documentation
- ✅ Quick start commands

AUTHOR

Divya Sree G