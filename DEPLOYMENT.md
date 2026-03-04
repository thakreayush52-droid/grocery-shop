# Grocery Shop Deployment Guide for Render

## Important Setup Steps

### 1. MongoDB Atlas Setup (CRITICAL FOR DATA ISOLATION)

Each user's data is now properly isolated using `createdBy` and `soldBy` fields. Make sure your MongoDB connection string includes proper authentication.

**Environment Variables for Backend:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grocery_shop?retryWrites=true&w=majority
PORT=5000
FRONTEND_URL=https://your-app-name.onrender.com
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### 2. Frontend Environment Variables

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=https://your-backend-name.onrender.com/api
```

### 3. Deploy Backend to Render

1. **Connect Repository** to Render
2. **Service Type**: Web Service
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && npm start`
5. **Environment Variables**: Add all from step 1

### 4. Deploy Frontend to Render

1. **Connect Repository** to Render
2. **Service Type**: Static Site
3. **Build Command**: `cd frontend && npm install && npm run build`
4. **Publish Directory**: `frontend/dist`
5. **Environment Variables**: Add `VITE_API_URL`

## User Data Isolation

The application now properly isolates data per user:

- **Products**: Filtered by `createdBy` field
- **Sales**: Filtered by `soldBy` field  
- **Dashboard Stats**: User-specific aggregations
- **Inventory Logs**: Filtered by `performedBy` field

Each authenticated user will only see their own data.

## Fixing "Page Not Found" on Refresh

The React Router issue has been fixed. The backend now properly handles client-side routing.

If you still face issues on Render:

1. For **Netlify/Vercel**: Create a `_redirects` or `vercel.json` file
2. For **Render Static Sites**: The configuration is automatic

## Testing Multi-User Setup

1. **Create User 1**: Register/Login → Add products → Make sales
2. **Create User 2**: Register/Login in different browser/incognito
3. **Verify**: User 2 should NOT see User 1's products/sales/profit

## Common Issues

### Issue: All users see same data
**Solution**: Make sure you're calling the API with proper authentication headers. Each request must include the JWT token.

### Issue: "Not Found" on refresh
**Solution**: This is handled by the backend catch-all route. If deploying frontend separately, configure your hosting provider's redirect rules.

### Issue: Images not uploading
**Solution**: On Render, you need cloud storage (Cloudinary, AWS S3). Local uploads won't persist across deployments.

## Production Checklist

- [ ] MongoDB Atlas cluster created and connection string added
- [ ] JWT_SECRET changed to a strong random value
- [ ] CORS configured with production URLs
- [ ] Frontend API URL points to backend service
- [ ] Tested user registration/login
- [ ] Verified data isolation between users
- [ ] Tested page refresh functionality
- [ ] Image upload strategy decided (local vs cloud)
