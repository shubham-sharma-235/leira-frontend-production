# Image Upload Setup Instructions

## Step 1: Install Multer
Run this command in the `backend` directory:
```bash
cd backend
npm install multer
```

## Step 2: Start Backend Server
Make sure your backend server is running:
```bash
cd backend
npm run dev
```

## Step 3: How It Works

### Backend:
- Images are uploaded to `backend/uploads/products/` directory
- Images are served from `http://localhost:5000/uploads/products/` 
- Database stores the path: `/uploads/products/filename.jpg`

### Frontend:
- Admin can upload images from computer (multiple files)
- Or add image URLs manually
- Images are automatically saved to database

## File Structure:
```
backend/
  uploads/
    products/
      (uploaded images will be stored here)
```

## API Endpoints:
- `POST /api/upload/product` - Upload single image
- `POST /api/upload/products` - Upload multiple images

Both endpoints require admin authentication.

