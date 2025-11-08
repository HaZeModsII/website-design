# Triple Barrel Racing - Drift Team Website

An underground drifting themed website for Triple Barrel Racing featuring a merch store, event management, contact system, and admin panel.

## Features

### Public Features
- **Landing Page**: Eye-catching homepage with spinning logo animation and underground drift aesthetic
- **Events Page**: Display drift events with ticket pricing and details
- **Store Page**: Browse and purchase team merchandise with category filtering
- **Contact System**: Submit inquiries for ticket purchases or general questions

### Admin Features
- **Secure Login**: Password-protected admin panel (credentials in .env)
- **Merchandise Management**: Add, update, and delete store items
- **Event Management**: Create and manage drift events
- **Inquiry Management**: View all contact form submissions
- **Real-time Updates**: Changes reflect immediately on the public site

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Email**: Resend API integration

## Project Structure 📂

```
/app
├── backend/            # FastAPI backend
│   ├── server.py       # Main FastAPI application
│   ├── requirements.txt
│   └── .env            # Environment variables for backend
├── frontend/           # React frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── pages/      # Page components
│   │   └── components/ # Reusable components
│   ├── package.json
│   └── .env            # Environment variables for frontend
└── README.md
```

## Environment Variables

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"

# Admin Credentials (CHANGE THESE!)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

# Email Configuration
RESEND_API_KEY=""  # Add your Resend API key here
ADMIN_EMAIL="admin@triplebarrelracing.com"
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=<your-backend-url>
```

## Setup Instructions

### 1. Configure Environment Variables

1. Update `/app/backend/.env` with your settings:
   - Set a strong `ADMIN_USERNAME` and `ADMIN_PASSWORD`
   - Add your Resend API key to `RESEND_API_KEY` (get one at https://resend.com)
   - Update `ADMIN_EMAIL` to receive contact form submissions

2. Restart backend after changes:
```bash
sudo supervisorctl restart backend
```

## Admin Panel Access

1. Navigate to `/admin`
2. Login with credentials from `.env`:
   - Default username: `admin`
   - Default password: `admin123`
3. **IMPORTANT**: Change these defaults in production!

## Email Integration

The contact form uses Resend to send email notifications:

1. Sign up at https://resend.com
2. Get your API key
3. Add it to `RESEND_API_KEY` in `/app/backend/.env`
4. Update `ADMIN_EMAIL` to your email address
5. Restart the backend: `sudo supervisorctl restart backend`

**Note**: If no API key is configured, contact submissions will still be saved to the database but emails won't be sent.

## API Endpoints

### Public Endpoints
- `GET /api/merch` - Get all merchandise items
- `GET /api/events` - Get all events
- `POST /api/contact` - Submit contact inquiry
- `POST /api/admin/login` - Admin login

### Admin Endpoints (Requires Authentication)
- `POST /api/merch` - Create merchandise item
- `PUT /api/merch/{id}` - Update merchandise item
- `DELETE /api/merch/{id}` - Delete merchandise item
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event
- `GET /api/inquiries` - Get all contact inquiries

## Design Theme

The website features an underground drifting aesthetic:
- Dark color scheme with red/orange neon accents
- Bebas Neue font for bold headlines
- Space Grotesk for body text
- Spinning logo animation
- Hover effects and smooth transitions
- Glass-morphism effects on cards

## Database Collections

- `merch` - Merchandise items (name, price, category, stock, image)
- `events` - Drift events (name, date, location, ticket price, image)
- `inquiries` - Contact form submissions (name, email, phone, message)

## Security Notes

1. **Change default admin credentials** in production
2. Store sensitive data in environment variables
3. Use strong passwords
4. Keep API keys private
5. Consider adding rate limiting for API endpoints

## Troubleshooting

### Backend not starting?
```bash
tail -n 50 /var/log/supervisor/backend.err.log
```

### Frontend not loading?
```bash
tail -n 50 /var/log/supervisor/frontend.err.log
```

---

Built with Emergent Agent - Made for drift enthusiasts 🏁

