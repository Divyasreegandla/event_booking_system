import qrcode
from io import BytesIO
import base64
from sqlalchemy.orm import Session
from app.models.ticket import Ticket

class QRService:
    def generate_qr_code(self, data: str):
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def generate_ticket_qr_codes(self, booking_id: int, quantity: int, db: Session):
        tickets = db.query(Ticket).filter(Ticket.booking_id == booking_id).all()
        
        for ticket in tickets:
            qr_data = f"TICKET:{ticket.ticket_code}:BOOKING:{booking_id}"
            qr_code = self.generate_qr_code(qr_data)
            ticket.qr_code = qr_code
        
        db.commit()