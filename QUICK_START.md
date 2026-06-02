# 🏃 Quick Start Guide

Get the app running locally in minutes.

---

## ✅ Prerequisites

- **Node.js 18+** and **npm 9+**
  - [Download Node.js](https://nodejs.org/)
- **Git**
- **Firebase Service Account Key** (optional for local dev, required for backend)

---

## 🚀 Local Development Setup

### 1️⃣ Clone & Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Kaushal-Skill-Swapping.git
cd Kaushal-Skill-Swapping

# Install all dependencies
npm run install:all
```

### 2️⃣ Backend Setup

```bash
cd kaushal-backend/express-backend

# Copy environment variables
cp .env.example .env

# Add your Firebase credentials to .env
# You need:
# - FIREBASE_PROJECT_ID
# - FIREBASE_PRIVATE_KEY
# - FIREBASE_CLIENT_EMAIL

# Place your serviceAccountKey.json in this folder

# Start backend (runs on port 3000)
npm run dev
```

### 3️⃣ Frontend Setup (in new terminal)

```bash
cd kaushal-frontend

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your Firebase config
# and VITE_API_URL=http://localhost:3000

# Start frontend (runs on port 5173)
npm run dev
```

### 4️⃣ Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 📁 Project Structure

```
Kaushal-Skill-Swapping/
├── kaushal-frontend/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── kaushal-backend/
│   └── express-backend/       # Express backend
│       ├── server.js
│       ├── serviceAccountKey.json  (⚠️ Don't commit!)
│       ├── .env
│       └── package.json
├── README.md                   # Project overview
├── DEPLOYMENT_GUIDE.md        # How to deploy
├── QUICK_START.md             # This file
├── vercel.json                # Vercel config
├── railway.json               # Railway config
└── package.json               # Root workspace config
```

---

## 🔧 Available Scripts

### Root Level
```bash
npm run dev:frontend    # Start frontend dev server
npm run dev:backend     # Start backend
npm run build:frontend  # Build frontend for production
npm run install:all     # Install all dependencies
```

### Frontend Only
```bash
cd kaushal-frontend
npm run dev             # Dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### Backend Only
```bash
cd kaushal-backend/express-backend
npm run dev             # Dev server with nodemon
npm start               # Production server
```

---

## 🔑 Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_SECRET=your_zego_secret
```

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email@appspot.gserviceaccount.com
CORS_ORIGIN=http://localhost:5173
```

---

## 🐛 Common Issues

### "PORT 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### "Cannot find serviceAccountKey.json"
- Download from Firebase Console → Service Accounts
- Place in `kaushal-backend/express-backend/`
- Never commit to git!

### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend can't reach backend
- Check backend is running on port 3000
- Verify `VITE_API_URL=http://localhost:3000` in .env.local
- Check CORS settings in backend

---

## 📚 Next Steps

1. ✅ Get it running locally
2. ✅ Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment
3. ✅ Check [README.md](./README.md) for features and tech stack

---

**Happy coding! 🚀**
