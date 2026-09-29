# Setup Instructions - Leira Project

## Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Copy this content to backend/.env:

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/leira
JWT_SECRET=5106739860812d5e8b4228aabe5ba3d31fe40847e24b40ee582bce688d186c348ed782717388c1d5ecf13b5b28b0c7eb6e9406f802f49cfe4528603d61688efc
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000

# Seed products to database
npm run seed

# Create admin user
npm run create-admin

# Start backend server
npm run dev
```

**Backend should be running on:** `http://localhost:5000`

### 2. Frontend Setup

```bash
# In root folder (leira/)
# Create .env.local file with:

NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start frontend (if not already running)
npm run dev
```

**Frontend should be running on:** `http://localhost:3000`

### 3. MongoDB Setup

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Use: `mongodb://localhost:27017/leira`

**Option B: MongoDB Atlas (Cloud)**
- Create account at mongodb.com/atlas
- Create cluster
- Get connection string
- Use: `mongodb+srv://username:password@cluster.mongodb.net/leira`

### 4. Verify Setup

1. **Check Backend:**
   - Open: `http://localhost:5000`
   - Should see: `{"message":"Leira API Server is running!","version":"1.0.0","status":"active"}`

2. **Check API:**
   - Open: `http://localhost:5000/api/products`
   - Should see products JSON

3. **Check Frontend:**
   - Open: `http://localhost:3000`
   - Products should load from API

### 5. Admin Panel Access

- URL: `http://localhost:3000/admin/login`
- Email: `admin@leira.com`
- Password: `admin123`

## Troubleshooting

### "Failed to fetch" Error

**Problem:** Frontend cannot connect to backend

**Solutions:**
1. ✅ Make sure backend is running (`npm run dev` in backend folder)
2. ✅ Check backend is on port 5000
3. ✅ Verify `.env.local` has correct API URL
4. ✅ Check MongoDB is running (if using local)
5. ✅ Restart both frontend and backend

### MongoDB Connection Error

**Problem:** Backend cannot connect to MongoDB

**Solutions:**
1. ✅ Check MongoDB is running
2. ✅ Verify MONGODB_URI in backend/.env
3. ✅ Check MongoDB Compass connection
4. ✅ For Atlas: Check IP whitelist

### Products Not Loading

**Problem:** Products array is empty

**Solutions:**
1. ✅ Run seed script: `npm run seed` in backend folder
2. ✅ Check MongoDB has products collection
3. ✅ Verify API endpoint: `http://localhost:5000/api/products`

## Common Commands

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev         # Start dev server
npm run seed        # Seed products
npm run create-admin # Create admin user

# Frontend
npm run dev         # Start Next.js dev server
npm run build       # Build for production
```

## Environment Variables Summary

### Backend (.env)
- `PORT` - Server port (5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `CORS_ORIGIN` - Frontend URL

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

