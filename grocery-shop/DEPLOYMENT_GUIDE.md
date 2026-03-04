# Deployment Guide for Grocery Shop on Render

## Issues Fixed

### 1. ✅ All Users Seeing Same Data
**Problem:** Using local MongoDB connection (`mongodb://localhost:27017`)

**Solution:** Use MongoDB Atlas (cloud-hosted database)

### 2. ✅ Product Images Not Uploading
**Problem:** Local file storage doesn't persist on Render's ephemeral filesystem

**Solution:** Integrated Cloudinary for cloud image storage

### 3. ✅ Seed Data Not Showing
**Problem:** No automatic database seeding on deployment

**Solution:** Added auto-seeding functionality with `AUTO_SEED` environment variable

---

## Setup Instructions

### Step 1: Create MongoDB Atlas Account (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user with username and password
5. Whitelist IP: `0.0.0.0/0` (allow access from anywhere)
6. Get your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/grocery_shop?retryWrites=true&w=majority
   ```

### Step 2: Create Cloudinary Account (Free)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Note your credentials from dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Update Backend .env File

Update `grocery-shop/backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/grocery_shop?retryWrites=true&w=majority
JWT_SECRET=grocery_shop_secret_key_2024
ML_SERVICE_URL=http://localhost:5001
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
AUTO_SEED=true
```

**IMPORTANT:** Replace the placeholder values with your actual credentials!

### Step 4: Install New Dependencies

In your backend folder, run:
```bash
cd grocery-shop/backend
npm install
```

This will install the new `cloudinary` package.

### Step 5: Deploy to Render

#### Backend Setup:

1. **Push code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Fix deployment issues: Cloudinary integration + auto-seeding"
   git push origin main
   ```

2. **Create Render Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** grocery-shop-backend
     - **Environment:** Node
     - **Build Command:** `cd grocery-shop/backend && npm install`
     - **Start Command:** `cd grocery-shop/backend && npm start`
     - **Instance Type:** Free

3. **Add Environment Variables in Render:**
   In Render dashboard → Environment tab, add:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/grocery_shop?retryWrites=true&w=majority
   JWT_SECRET=grocery_shop_secret_key_2024
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   AUTO_SEED=true
   ```

4. **Deploy!**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://grocery-shop-backend.onrender.com`)

#### Frontend Setup:

1. **Update API URL:**
   Update `grocery-shop/frontend/src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
   ```

2. **Deploy Frontend to Render:**
   - New + → Static Site
   - Connect GitHub repository
   - Configure:
     - **Name:** grocery-shop-frontend
     - **Build Command:** `cd grocery-shop/frontend && npm install && npm run build`
     - **Publish Directory:** `grocery-shop/frontend/dist`
     - **Environment Variables:** Add API_BASE_URL if needed

---

## Testing After Deployment

### 1. Test Database Connection
- Check Render logs for "Connected to MongoDB" message
- Verify auto-seeding ran successfully

### 2. Test Image Upload
- Create a new product with an image
- Verify image appears in Cloudinary dashboard
- Check that product displays correctly

### 3. Test Multi-User Access
- Login with different users
- Verify all users see the same products (shared database)
- Each user should have their own login session

---

## Troubleshooting

### Images Still Not Uploading?

1. Check Cloudinary credentials in .env
2. Verify Cloudinary account is active
3. Check Render logs for upload errors
4. Ensure file size is under 5MB

### Seed Data Not Appearing?

1. Set `AUTO_SEED=true` in environment variables
2. Check Render logs for seeding messages
3. Manually trigger seed by running locally:
   ```bash
   cd grocery-shop/backend
   node seedProducts.js
   ```

### Database Connection Fails?

1. Verify MongoDB Atlas connection string
2. Check IP whitelist includes `0.0.0.0/0`
3. Ensure database user credentials are correct
4. Test connection string locally first

### CORS Errors?

Update backend server.js to allow your frontend domain:
```javascript
app.use(cors({
  origin: ['https://your-frontend.onrender.com', 'http://localhost:5173']
}));
```

---

## Important Notes

⚠️ **Security Best Practices:**
- Never commit .env files to GitHub
- Use strong passwords for database
- Rotate JWT secrets regularly
- Enable HTTPS (Render does this automatically)

💰 **Cost Considerations:**
- MongoDB Atlas Free Tier: 512MB storage
- Cloudinary Free Tier: 25GB storage, 25GB bandwidth/month
- Render Free Tier: Limited hours/month (may sleep after inactivity)

📊 **Monitoring:**
- Check Render dashboard for logs
- Monitor MongoDB Atlas for database performance
- Track Cloudinary usage to stay within free limits

---

## Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Cloudinary account set up with credentials
- [ ] Backend deployed and running on Render
- [ ] Frontend deployed and accessible
- [ ] Auto-seeding completed successfully
- [ ] Image uploads working
- [ ] Multiple users can access shared data
- [ ] All API endpoints responding
- [ ] No errors in Render logs

---

## Need Help?

Check these resources:
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Cloudinary Docs](https://cloudinary.com/documentation)

Good luck with your deployment! 🚀
