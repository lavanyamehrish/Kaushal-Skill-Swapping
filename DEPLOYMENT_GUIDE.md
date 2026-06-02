# 🚀 Project Kaushal - Deployment Guide

This guide will help you deploy your Project Kaushal app to the internet with **Vercel** (frontend) and **Railway** (backend).

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. **GitHub account** - To host your code
2. **Vercel account** - For frontend (free) - [Sign up](https://vercel.com)
3. **Railway account** - For backend (free) - [Sign up](https://railway.app)
4. **Firebase credentials** - Service account key and config

---

## 🔑 Step 1: Setup Firebase Credentials

### Get Your Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json`

### Place Service Account Key
- **For backend**: Copy to `kaushal-backend/express-backend/serviceAccountKey.json`
- **⚠️ IMPORTANT**: Never commit this file to GitHub!

### Get Firebase Web Config
1. In Firebase Console, go to **Settings** → **General**
2. Scroll down and copy your Firebase config object
3. You'll need these values for environment variables

---

## 📤 Step 2: Push to GitHub

### Initialize and Push
```bash
# Navigate to project directory
cd /path/to/Kaushal-Skill-Swapping-main

# Create a new repository on GitHub (visit github.com/new)
# Then run:

git remote add origin https://github.com/YOUR_USERNAME/Kaushal-Skill-Swapping.git
git branch -M main
git push -u origin main
```

### Add Environment Secrets to .gitignore
Your `.gitignore` should include:
```
.env
.env.local
serviceAccountKey.json
.DS_Store
node_modules/
dist/
```

---

## 🌐 Step 3: Deploy Backend on Railway

### Create Railway Account & Project
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Deploy via GitHub
1. Click **Deploy from GitHub repo**
2. Connect your GitHub repository
3. Select this repo: `Kaushal-Skill-Swapping`
4. Railway will automatically detect the configuration

### Configure Environment Variables
In Railway dashboard, go to **Variables** and add:

```
PORT=3000
NODE_ENV=production
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key_here
FIREBASE_CLIENT_EMAIL=your_firebase_client_email@appspot.gserviceaccount.com
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

**To get `FIREBASE_PRIVATE_KEY`:**
- Open your `serviceAccountKey.json`
- Copy the entire `private_key` value (including quotes)
- Paste it as the environment variable

### Get Your Backend URL
- In Railway dashboard, find the **Public URL** (something like: `https://your-app.railway.app`)
- Save this URL - you'll need it for frontend deployment

---

## ⚛️ Step 4: Deploy Frontend on Vercel

### Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Select this repo: `Kaushal-Skill-Swapping`

### Configure Build Settings
Vercel should auto-detect these, but verify:
- **Framework**: Vite
- **Build Command**: `cd kaushal-frontend && npm run build`
- **Output Directory**: `kaushal-frontend/dist`
- **Install Command**: `cd kaushal-frontend && npm install`

### Configure Environment Variables
In Vercel project settings, go to **Environment Variables** and add:

```
VITE_API_URL=https://your-railway-url.railway.app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_SECRET=your_zego_server_secret
```

### Deploy
1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. You'll get a URL like: `https://kaushal.vercel.app`

**✅ Your app is now live!**

---

## 🔗 Update Backend CORS

After deploying frontend:
1. Go back to Railway dashboard
2. Update `CORS_ORIGIN` variable with your Vercel URL:
   ```
   CORS_ORIGIN=https://kaushal.vercel.app,https://yourdomain.com
   ```
3. Redeploy backend (should happen automatically)

---

## 📝 Add Link to GitHub

Update your `README.md` with deployment links:

```markdown
## 🚀 Live Demo

- **Frontend**: https://kaushal.vercel.app
- **API Documentation**: https://your-railway-url.railway.app/api

## 🛠 Deployment

This project is deployed on:
- Frontend: [Vercel](https://vercel.com)
- Backend: [Railway](https://railway.app)
- Database: [Firebase](https://firebase.google.com)
```

---

## 🐛 Troubleshooting

### Backend not responding
- Check Railway logs: Dashboard → **Logs** tab
- Verify environment variables are set correctly
- Check CORS_ORIGIN includes your frontend URL

### Frontend shows errors
- Check Vercel logs: Dashboard → **Deployments** → **View Logs**
- Verify `VITE_API_URL` matches your Railway URL
- Check browser console for errors (F12)

### Firebase errors
- Verify `serviceAccountKey.json` is in correct folder
- Check Firebase credentials in environment variables
- Ensure Firebase project is active in [console.firebase.google.com](https://console.firebase.google.com)

### "Port already in use"
- Railway automatically handles port assignment
- Vercel handles static hosting

---

## 🔄 Making Updates

To update your deployed app:
1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. Railway and Vercel automatically redeploy on push to main branch

---

## 💰 Cost

- **Frontend (Vercel)**: FREE forever for most projects
- **Backend (Railway)**: FREE tier available (includes $5/month credits)
- **Database (Firebase)**: FREE tier available (generous limits)

---

## ✨ Next Steps

1. ✅ Test your deployed app
2. ✅ Share the link: Your frontend URL (e.g., https://kaushal.vercel.app)
3. ✅ Update GitHub README with live links
4. ✅ Monitor logs for any issues

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Firebase Docs**: https://firebase.google.com/docs
- **Express Docs**: https://expressjs.com

---

**Congratulations! Your app is now ready for the world! 🎉**
