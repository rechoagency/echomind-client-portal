# EchoMind Client Dashboard

**Intelligent Reddit Marketing Automation**

## Overview

EchoMind is a sophisticated Reddit marketing automation platform that provides:
- 🧠 Voice analytics and user intelligence
- 🎯 Targeted Reddit Answers (organic Q&A)
- 📊 Reddit Pro campaign management (paid ads)
- 📈 Automated performance reporting
- 🤖 Client-specific subreddit monitoring

## Quick Start

### 1. Configure Backend Connection

Edit `js/app.js` line 4:

```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

Replace `your-backend-url.com` with your actual backend API URL.

### 2. Open Dashboard

Simply open `index.html` in a web browser or deploy to a web server.

### 3. Onboard Your First Client

1. Click "Add New Client"
2. Fill in all 5 sections:
   - Basic Information
   - Product Information
   - Target Subreddits
   - Keywords & Topics
   - Contact & Notifications
3. Click "Onboard Client"

The system will automatically:
- Build voice intelligence database (300-900 profiles)
- Start monitoring target subreddits
- Begin automated Reddit Answers posting
- Set up performance tracking

## Features

### Dashboard
- Backend connection status
- Active clients count
- Active campaigns count
- Client list with quick access

### Client Onboarding
- 5-step form for complete client setup
- Target subreddit configuration
- Keyword and topic targeting
- Notification preferences

### Troubleshooting
- Common issues and solutions
- Backend connection help
- Reddit automation diagnostics

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** Supabase (PostgreSQL)
- **Automation:** Celery + Redis

## Deployment

### Option 1: Netlify (Recommended)
1. Create GitHub repository
2. Upload these files
3. Connect to Netlify
4. Deploy automatically

### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel deploy`

### Option 3: Self-Hosted
1. Copy files to web server (Nginx/Apache)
2. Serve as static site

## File Structure

```
echomind-ui/
├── index.html          # Main dashboard
├── css/
│   └── style.css       # Custom styling
├── js/
│   └── app.js          # Application logic
└── README.md           # This file
```

## Configuration

### Backend API Endpoints

The dashboard expects these API endpoints:

- `GET /api/health` - Backend health check
- `GET /api/client-onboarding/clients` - List all clients
- `POST /api/client-onboarding/clients` - Create new client
- `GET /api/client-onboarding/clients/{id}` - Get client details

### CORS Configuration

Ensure your backend allows requests from your frontend domain:

```python
# In FastAPI backend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Support

For issues or questions, contact your EchoMind administrator.

## Version

**v1.0.0** - Initial Release (November 2025)

---

Built with ❤️ for intelligent Reddit marketing automation
