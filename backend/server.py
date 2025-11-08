from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MerchItemCreate(BaseModel):
    name: str
    description: str
    price: float
    image_url: str
    category: str
    stock: int = 0

class MerchItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = None

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

class ContactInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    inquiry_type: str  # 'ticket' or 'general'
    name: str
    email: EmailStr
    phone: str
    message: str
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactInquiryCreate(BaseModel):
    inquiry_type: str
    name: str
    email: EmailStr
    phone: str
    message: str
    event_id: Optional[str] = None
    event_name: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None


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

# Contact/Inquiry Routes
@api_router.post("/contact")
async def submit_contact(inquiry: ContactInquiryCreate):
    inquiry_obj = ContactInquiry(**inquiry.model_dump())
    doc = inquiry_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.inquiries.insert_one(doc)
    
    # Send email via Resend
    try:
        if resend.api_key:
            email_subject = f"New {inquiry.inquiry_type.title()} Inquiry from {inquiry.name}"
            email_html = f"""
            <h2>New Contact Inquiry - Triple Barrel Racing</h2>
            <p><strong>Type:</strong> {inquiry.inquiry_type.title()}</p>
            <p><strong>Name:</strong> {inquiry.name}</p>
            <p><strong>Email:</strong> {inquiry.email}</p>
            <p><strong>Phone:</strong> {inquiry.phone}</p>
            {f'<p><strong>Event:</strong> {inquiry.event_name}</p>' if inquiry.event_name else ''}
            <p><strong>Message:</strong></p>
            <p>{inquiry.message}</p>
            """
            
            resend.Emails.send({
                "from": "Triple Barrel Racing <onboarding@resend.dev>",
                "to": [os.environ.get('ADMIN_EMAIL', 'admin@triplebarrelracing.com')],
                "subject": email_subject,
                "html": email_html
            })
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        # Don't fail the request if email fails
    
    return {"message": "Inquiry submitted successfully", "id": inquiry_obj.id}

@api_router.get("/inquiries", response_model=List[ContactInquiry])
async def get_inquiries(admin: bool = Depends(verify_admin)):
    inquiries = await db.inquiries.find({}, {"_id": 0}).to_list(1000)
    for inquiry in inquiries:
        if isinstance(inquiry.get('created_at'), str):
            inquiry['created_at'] = datetime.fromisoformat(inquiry['created_at'])
    return inquiries

# Include the router in the main app
app.include_router(api_router)

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
