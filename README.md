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
