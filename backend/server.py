from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import resend
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class MerchItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image_url: str
    category: str
    stock: int = 0
    sizes: Optional[dict] = None  # Dictionary mapping size to stock count: {"S": 10, "M": 15}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MerchItemCreate(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    category: str
    stock: int = 0
    sizes: Optional[dict] = None  # Dictionary mapping size to stock count: {"S": 10, "M": 15}

class MerchItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    sizes: Optional[dict] = None  # Dictionary mapping size to stock count: {"S": 10, "M": 15}

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    date: str
    location: str
    image_url: str
    ticket_price: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    name: str
    description: str
    date: str
    location: str
    image_url: str
    ticket_price: float

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    ticket_price: Optional[float] = None

class CarPart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    car_model: str
    year: str
    category: str  # 'Engine', 'Suspension', 'Drivetrain', 'Exterior', 'Interior', 'Brakes', 'Other'
    condition: str  # 'new', 'used-excellent', 'used-good', 'used-fair'
    image_url: str
    stock: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarPartCreate(BaseModel):
    name: str
    description: str
    price: float
    car_model: str
    year: str
    category: str
    condition: str
    image_url: str
    stock: int = 1

class CarPartUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    car_model: Optional[str] = None
    year: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None

class ContactInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    inquiry_type: str  # 'ticket', 'order', or 'general'
    name: str
    email: EmailStr
    phone: str
    message: str
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    item_details: Optional[str] = None
    status: str = 'pending'  # 'pending', 'contacted', 'completed', 'cancelled'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactInquiryCreate(BaseModel):
    inquiry_type: str
    name: str
    email: EmailStr
    phone: str
    message: str
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    item_details: Optional[str] = None

class InquiryStatusUpdate(BaseModel):
    status: str

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None

# Order Models
class OrderLineItem(BaseModel):
    product_id: str
    product_name: str
    variant_id: Optional[str] = None
    size: Optional[str] = None
    quantity: int
    unit_price: float

class OrderCreate(BaseModel):
    customer_email: EmailStr
    customer_name: str
    line_items: List[OrderLineItem]

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_email: EmailStr
    customer_name: str
    line_items: List[OrderLineItem]
    total_amount: float
    status: str = "pending"  # pending, completed, failed, cancelled
    square_payment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentRequest(BaseModel):
    order_id: str
    source_id: str  # Token from Square Web Payments SDK


# Admin verification
async def verify_admin(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    try:
        token = authorization.replace('Bearer ', '')
        # Simple token check: username:password encoded
        if token == f"{admin_username}:{admin_password}":
            return True
    except:
        pass
    
    raise HTTPException(status_code=401, detail="Invalid authentication")


# Routes
@api_router.get("/")
async def root():
    return {"message": "Triple Barrel Racing API"}

# Admin Login
@api_router.post("/admin/login", response_model=AdminResponse)
async def admin_login(credentials: AdminLogin):
    admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    if credentials.username == admin_username and credentials.password == admin_password:
        token = f"{admin_username}:{admin_password}"
        return AdminResponse(
            success=True,
            message="Login successful",
            token=token
        )
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Merch Routes
@api_router.get("/merch", response_model=List[MerchItem])
async def get_merch():
    items = await db.merch.find({}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.post("/merch", response_model=MerchItem)
async def create_merch(item: MerchItemCreate, admin: bool = Depends(verify_admin)):
    merch_obj = MerchItem(**item.model_dump())
    doc = merch_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.merch.insert_one(doc)
    return merch_obj

@api_router.put("/merch/{item_id}", response_model=MerchItem)
async def update_merch(item_id: str, item_update: MerchItemUpdate, admin: bool = Depends(verify_admin)):
    existing = await db.merch.find_one({"id": item_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = {k: v for k, v in item_update.model_dump().items() if v is not None}
    if update_data:
        await db.merch.update_one({"id": item_id}, {"$set": update_data})
    
    updated = await db.merch.find_one({"id": item_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return MerchItem(**updated)

@api_router.delete("/merch/{item_id}")
async def delete_merch(item_id: str, admin: bool = Depends(verify_admin)):
    result = await db.merch.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

# Event Routes
@api_router.get("/events", response_model=List[Event])
async def get_events():
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
    return events

@api_router.post("/events", response_model=Event)
async def create_event(event: EventCreate, admin: bool = Depends(verify_admin)):
    event_obj = Event(**event.model_dump())
    doc = event_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.events.insert_one(doc)
    return event_obj

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_update: EventUpdate, admin: bool = Depends(verify_admin)):
    existing = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = {k: v for k, v in event_update.model_dump().items() if v is not None}
    if update_data:
        await db.events.update_one({"id": event_id}, {"$set": update_data})
    
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Event(**updated)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, admin: bool = Depends(verify_admin)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}


# Car Parts Routes
@api_router.get("/parts", response_model=List[CarPart])
async def get_parts():
    parts = await db.parts.find({}, {"_id": 0}).to_list(1000)
    for part in parts:
        if isinstance(part.get('created_at'), str):
            part['created_at'] = datetime.fromisoformat(part['created_at'])
    return parts

@api_router.post("/parts", response_model=CarPart)
async def create_part(part: CarPartCreate, admin: bool = Depends(verify_admin)):
    part_obj = CarPart(**part.model_dump())
    doc = part_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.parts.insert_one(doc)
    return part_obj

@api_router.put("/parts/{part_id}", response_model=CarPart)
async def update_part(part_id: str, part_update: CarPartUpdate, admin: bool = Depends(verify_admin)):
    existing = await db.parts.find_one({"id": part_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Part not found")
    
    update_data = {k: v for k, v in part_update.model_dump().items() if v is not None}
    if update_data:
        await db.parts.update_one({"id": part_id}, {"$set": update_data})
    
    updated = await db.parts.find_one({"id": part_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return CarPart(**updated)

@api_router.delete("/parts/{part_id}")
async def delete_part(part_id: str, admin: bool = Depends(verify_admin)):
    result = await db.parts.delete_one({"id": part_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Part not found")
    return {"message": "Part deleted successfully"}


# Email Helper Functions
async def send_customer_confirmation_email(inquiry: ContactInquiry):
    """Send confirmation email to customer"""
    try:
        if not resend.api_key:
            return
        
        from_email = os.environ.get('FROM_EMAIL', 'Triple Barrel Racing <onboarding@resend.dev>')
        
        if inquiry.inquiry_type in ['order', 'parts']:
            subject = f"Order Confirmation - Triple Barrel Racing #{inquiry.id[:8]}"
            html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Order Received!</h2>
                <p>Hi {inquiry.name},</p>
                <p>Thank you for your order! We've received your request and will process it shortly.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Order Details:</h3>
                    <p><strong>Order ID:</strong> #{inquiry.id[:8]}</p>
                    {f'<p><strong>Item:</strong> {inquiry.item_details}</p>' if inquiry.item_details else ''}
                    <p><strong>Status:</strong> Pending</p>
                </div>
                
                <p><strong>Your Message:</strong><br/>{inquiry.message}</p>
                
                <p>We'll contact you at <strong>{inquiry.email}</strong> or <strong>{inquiry.phone}</strong> to confirm details and arrange payment/shipping.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                    Triple Barrel Racing<br/>
                    Underground Drift Culture · Street Racing · Pure Adrenaline
                </p>
            </div>
            """
        else:
            subject = f"Inquiry Confirmation - Triple Barrel Racing"
            html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Thank You For Contacting Us!</h2>
                <p>Hi {inquiry.name},</p>
                <p>We've received your {inquiry.inquiry_type} inquiry and will get back to you as soon as possible.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Your Inquiry:</h3>
                    {f'<p><strong>Event:</strong> {inquiry.event_name}</p>' if inquiry.event_name else ''}
                    <p>{inquiry.message}</p>
                </div>
                
                <p>We'll respond to <strong>{inquiry.email}</strong> or call you at <strong>{inquiry.phone}</strong> within 24 hours.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                    Triple Barrel Racing<br/>
                    Underground Drift Culture · Street Racing · Pure Adrenaline
                </p>
            </div>
            """
        
        resend.Emails.send({
            "from": from_email,
            "to": [inquiry.email],
            "subject": subject,
            "html": html
        })
        logger.info(f"Confirmation email sent to {inquiry.email}")
    except Exception as e:
        logger.error(f"Failed to send customer confirmation email: {str(e)}")

async def send_admin_notification_email(inquiry: ContactInquiry):
    """Send notification email to admin"""
    try:
        if not resend.api_key:
            return
        
        from_email = os.environ.get('FROM_EMAIL', 'Triple Barrel Racing <onboarding@resend.dev>')
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@triplebarrelracing.com')
        
        subject = f"New {inquiry.inquiry_type.title()} from {inquiry.name}"
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">New Customer {inquiry.inquiry_type.title()}</h2>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Customer Details:</h3>
                <p><strong>Name:</strong> {inquiry.name}</p>
                <p><strong>Email:</strong> {inquiry.email}</p>
                <p><strong>Phone:</strong> {inquiry.phone}</p>
                <p><strong>Type:</strong> {inquiry.inquiry_type.title()}</p>
                <p><strong>Order ID:</strong> #{inquiry.id[:8]}</p>
            </div>
            
            {f'<p><strong>Event:</strong> {inquiry.event_name}</p>' if inquiry.event_name else ''}
            {f'<div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;"><strong>Order Details:</strong><br/>{inquiry.item_details}</div>' if inquiry.item_details else ''}
            
            <p><strong>Customer Message:</strong><br/>{inquiry.message}</p>
            
            <p style="margin-top: 30px;">
                <a href="#" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    View in Admin Panel
                </a>
            </p>
        </div>
        """
        
        resend.Emails.send({
            "from": from_email,
            "to": [admin_email],
            "subject": subject,
            "html": html
        })
        logger.info(f"Admin notification sent for inquiry {inquiry.id}")
    except Exception as e:
        logger.error(f"Failed to send admin notification email: {str(e)}")

async def send_order_status_email(inquiry: ContactInquiry, old_status: str, new_status: str):
    """Send email to customer when order status changes"""
    try:
        if not resend.api_key or inquiry.inquiry_type not in ['order', 'parts']:
            return
        
        from_email = os.environ.get('FROM_EMAIL', 'Triple Barrel Racing <onboarding@resend.dev>')
        
        status_messages = {
            'contacted': {
                'subject': 'We\'ve Contacted You About Your Order',
                'title': 'Order Update - We Reached Out!',
                'message': 'We\'ve attempted to contact you regarding your order. Please check your email and phone for our message.'
            },
            'processing': {
                'subject': 'Your Order is Being Processed',
                'title': 'Order Processing Started!',
                'message': 'Great news! Your order is now being prepared. We\'ll notify you once it\'s ready to ship.'
            },
            'shipped': {
                'subject': 'Your Order Has Been Shipped!',
                'title': 'Order Shipped! 🚚',
                'message': 'Your order is on its way! You should receive it within 3-5 business days. We\'ll send you tracking information shortly.'
            },
            'completed': {
                'subject': 'Order Completed - Thank You!',
                'title': 'Order Delivered Successfully! ✅',
                'message': 'Your order has been completed. We hope you\'re satisfied! If you have any issues, please contact us.'
            },
            'cancelled': {
                'subject': 'Order Cancelled',
                'title': 'Order Cancelled',
                'message': 'Your order has been cancelled. If this was done in error, please contact us immediately.'
            }
        }
        
        if new_status not in status_messages:
            return
        
        status_info = status_messages[new_status]
        
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">{status_info['title']}</h2>
            <p>Hi {inquiry.name},</p>
            <p>{status_info['message']}</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order Details:</h3>
                <p><strong>Order ID:</strong> #{inquiry.id[:8]}</p>
                {f'<p><strong>Item:</strong> {inquiry.item_details}</p>' if inquiry.item_details else ''}
                <p><strong>Status:</strong> <span style="color: #3b82f6; font-weight: bold;">{new_status.upper()}</span></p>
            </div>
            
            <p>If you have any questions, feel free to reply to this email or call us.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
                Triple Barrel Racing<br/>
                Underground Drift Culture · Street Racing · Pure Adrenaline
            </p>
        </div>
        """
        
        resend.Emails.send({
            "from": from_email,
            "to": [inquiry.email],
            "subject": status_info['subject'],
            "html": html
        })
        logger.info(f"Status update email sent to {inquiry.email} for order {inquiry.id}")
    except Exception as e:
        logger.error(f"Failed to send status update email: {str(e)}")

# Contact/Inquiry Routes
@api_router.post("/contact")
async def submit_contact(inquiry: ContactInquiryCreate):
    inquiry_obj = ContactInquiry(**inquiry.model_dump())
    doc = inquiry_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.inquiries.insert_one(doc)
    
    # Send emails asynchronously
    await send_customer_confirmation_email(inquiry_obj)
    await send_admin_notification_email(inquiry_obj)
    
    return {"message": "Inquiry submitted successfully", "id": inquiry_obj.id}

@api_router.get("/inquiries", response_model=List[ContactInquiry])
async def get_inquiries(admin: bool = Depends(verify_admin)):
    inquiries = await db.inquiries.find({}, {"_id": 0}).to_list(1000)
    for inquiry in inquiries:
        if isinstance(inquiry.get('created_at'), str):
            inquiry['created_at'] = datetime.fromisoformat(inquiry['created_at'])
    return inquiries

@api_router.patch("/inquiries/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, status_update: InquiryStatusUpdate, admin: bool = Depends(verify_admin)):
    # Get the inquiry before updating
    inquiry_doc = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    if not inquiry_doc:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    old_status = inquiry_doc.get('status', 'pending')
    new_status = status_update.status
    
    # Update the status
    result = await db.inquiries.update_one(
        {"id": inquiry_id},
        {"$set": {"status": new_status}}
    )
    
    # Create inquiry object for email
    if isinstance(inquiry_doc.get('created_at'), str):
        inquiry_doc['created_at'] = datetime.fromisoformat(inquiry_doc['created_at'])
    inquiry_obj = ContactInquiry(**inquiry_doc)
    inquiry_obj.status = new_status
    
    # Send status update email if status changed
    if old_status != new_status:
        await send_order_status_email(inquiry_obj, old_status, new_status)
    
    return {"message": "Status updated successfully"}

# Square Client Setup
from square.client import Client

def get_square_client():
    """Initialize Square client with environment credentials."""
    return Client(
        access_token=os.environ.get('SQUARE_ACCESS_TOKEN', ''),
        environment=os.environ.get('SQUARE_ENVIRONMENT', 'sandbox')
    )

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    """Create an order before payment processing."""
    # Calculate total amount
    total_amount = sum(item.unit_price * item.quantity for item in order_data.line_items)
    
    # Create order object
    order = Order(
        customer_email=order_data.customer_email,
        customer_name=order_data.customer_name,
        line_items=order_data.line_items,
        total_amount=total_amount
    )
    
    # Save to database
    order_doc = order.model_dump()
    order_doc['created_at'] = order_doc['created_at'].isoformat()
    order_doc['line_items'] = [item.model_dump() for item in order.line_items]
    
    await db.orders.insert_one(order_doc)
    
    logger.info(f"Order created: {order.id} for {order.customer_email}")
    return order

@api_router.post("/payments/process")
async def process_payment(payment_request: PaymentRequest):
    """Process a payment using Square Payments API."""
    # Retrieve order from database
    order_doc = await db.orders.find_one({"id": payment_request.order_id}, {"_id": 0})
    if not order_doc:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order_doc['status'] != "pending":
        raise HTTPException(status_code=400, detail="Order is not in pending state")
    
    # Reconstruct order object
    if isinstance(order_doc.get('created_at'), str):
        order_doc['created_at'] = datetime.fromisoformat(order_doc['created_at'])
    order = Order(**order_doc)
    
    try:
        # Initialize Square client
        square_client = get_square_client()
        
        # Create payment with Square Payments API
        amount_money = {
            "amount": int(order.total_amount * 100),  # Convert to cents
            "currency": "USD"
        }
        
        body = {
            "source_id": payment_request.source_id,
            "idempotency_key": str(uuid.uuid4()),
            "amount_money": amount_money,
            "location_id": os.environ.get('SQUARE_LOCATION_ID', ''),
            "reference_id": order.id,
            "note": f"Order {order.id} - {order.customer_name}"
        }
        
        result = square_client.payments.create_payment(body=body)
        
        if result.is_success():
            payment = result.body['payment']
            
            # Update order with payment information
            await db.orders.update_one(
                {"id": order.id},
                {"$set": {
                    "square_payment_id": payment['id'],
                    "status": "completed"
                }}
            )
            
            # Update inventory - reduce stock for each line item
            for line_item in order.line_items:
                merch = await db.merch.find_one({"id": line_item.product_id}, {"_id": 0})
                if merch and merch.get('sizes'):
                    # Update size-specific stock
                    if line_item.size in merch['sizes']:
                        new_stock = max(0, merch['sizes'][line_item.size] - line_item.quantity)
                        await db.merch.update_one(
                            {"id": line_item.product_id},
                            {"$set": {f"sizes.{line_item.size}": new_stock}}
                        )
                elif merch:
                    # Update regular stock for non-sized items
                    new_stock = max(0, merch.get('stock', 0) - line_item.quantity)
                    await db.merch.update_one(
                        {"id": line_item.product_id},
                        {"$set": {"stock": new_stock}}
                    )
            
            logger.info(f"Payment {payment['id']} processed successfully for order {order.id}")
            
            return {
                "success": True,
                "payment_id": payment['id'],
                "order_id": order.id,
                "amount": order.total_amount,
                "status": payment['status']
            }
        
        elif result.is_error():
            error_detail = result.errors[0]['detail'] if result.errors else "Unknown error"
            logger.warning(f"Error processing payment: {error_detail}")
            
            # Update order status to failed
            await db.orders.update_one(
                {"id": order.id},
                {"$set": {"status": "failed"}}
            )
            
            raise HTTPException(status_code=400, detail=error_detail)
    
    except Exception as e:
        logger.error(f"Exception processing payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment processing failed")

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    """Retrieve order details."""
    order_doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order_doc:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if isinstance(order_doc.get('created_at'), str):
        order_doc['created_at'] = datetime.fromisoformat(order_doc['created_at'])
    
    return order_doc

# File Upload Endpoint
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), admin: bool = Depends(verify_admin)):
    """Upload an image file and return its URL."""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
    
    # Return the URL path
    return {"image_url": f"/uploads/{unique_filename}"}

# Include the router in the main app
app.include_router(api_router)

# Mount uploads directory for static file serving
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
