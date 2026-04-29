from fastapi import HTTPException, status

class BookingError(Exception):
    pass

def handle_booking_error():
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Booking validation failed"
    )

def unauthorized_error():
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )