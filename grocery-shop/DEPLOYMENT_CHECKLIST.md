# 🚀 Deployment Checklist for Grocery Shop

## Pre-Deployment Setup (Do This First!)

### 1. MongoDB Atlas Setup ⭐
- [ ] Go to https://www.mongodb.com/cloud/atlas/register
- [ ] Create free account
- [ ] Create new cluster (M0 Free tier)
- [ ] Create database user with username/password
- [ ] Note down username and password
- [ ] In Network Access, add IP: `0.0.0.0/0` (allow all)
- [ ] Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/db`)
- [ ] Replace `<password>` in connection string with actual password
- [ ] Test connection locally if possible

### 2. Cloudinary Setup 📸
- [ ] Go to https://cloudinary.com
- [ ] Sign up for free account
- [ ] From dashboard, copy:
  - [ ] Cloud Name
  - [ ] API Key
  - [ ] API Secret
- [ ] Keep these handy for Render environment variables

### 3. Update Local .env File 🔐
- [ ] Open `grocery-shop/backend/.env`
- [ ] Update `MONGODB_URI` with your Atlas connection string
- [ ] Add `CLOUDINARY_CLOUD_NAME=your-cloud-name`
- [ ] Add `CLOUDINARY_API_KEY=your-api-key`
- [ ] Add `CLOUDINARY_API_SECRET=your-api-secret`
- [ ] Set `AUTO_SEED=true` (for first deployment only)
- [ ] Save the file

### 4. Install Dependencies 📦
```bash
cd grocery-shop/backend
npm install
```
- [ ] Verify cloudinary package installed successfully

### 5. Test Locally 🧪
```bash
# Terminal 1 - Backend
cd grocery-shop/backend
npm start

# Terminal 2 - Frontend
cd grocery-shop/frontend
npm run dev
```
- [ ] Backend starts without errors
- [ ] Frontend loads successfully
- [ ] Can login/register
- [ ] Can create a product WITH image
- [ ] Image uploads successfully and displays
- [ ] Products appear in list
- [ ] Seed data works (if AUTO_SEED=true)

---

## Deploy Backend to Render ☁️

### 6. Push to GitHub 💻
```bash
git add .
git commit -m "Fix deployment: Cloudinary integration + auto-seeding"
git push origin main
```
- [ ] Code pushed to GitHub
- [ ] Verify .env files are NOT committed (check .gitignore)

### 7. Create Render Web Service 🖥️
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Configure service:
  - [ ] Name: `grocery-shop-backend`
  - [ ] Region: Choose closest to you
  - [ ] Branch: `main`
  - [ ] Root Directory: `grocery-shop/backend`
  - [ ] Runtime: `Node`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Instance Type: Free

### 8. Add Environment Variables to Render 🔑
In Render dashboard → Environment tab, add EACH variable separately:

- [ ] `PORT` = `5000`
- [ ] `MONGODB_URI` = `mongodb+srv://user:pass@cluster.mongodb.net/grocery_shop?retryWrites=true&w=majority`
- [ ] `JWT_SECRET` = `grocery_shop_secret_key_2024` (or generate new random string)
- [ ] `CLOUDINARY_CLOUD_NAME` = `your-cloud-name`
- [ ] `CLOUDINARY_API_KEY` = `your-api-key`
- [ ] `CLOUDINARY_API_SECRET` = `your-api-secret`
- [ ] `AUTO_SEED` = `true` (first deployment only)
- [ ] `FRONTEND_URL` = (will add after frontend deployment)

### 9. Deploy Backend 🎯
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (watch logs)
- [ ] Check for "Connected to MongoDB" message
- [ ] Check for "Auto-seeding database..." message
- [ ] Copy your backend URL (e.g., `https://grocery-shop-backend.onrender.com`)
- [ ] Test health endpoint: `https://your-url.onrender.com/api/health`

---

## Deploy Frontend to Render 🎨

### 10. Update Frontend API URL 🌐
Edit `grocery-shop/frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend-url.onrender.com/api';
```
- [ ] Replace `your-backend-url` with actual backend URL
- [ ] Save file
- [ ] Commit and push to GitHub

### 11. Create Render Static Site 📱
- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Static Site"
- [ ] Connect GitHub repository
- [ ] Configure:
  - [ ] Name: `grocery-shop-frontend`
  - [ ] Branch: `main`
  - [ ] Root Directory: `grocery-shop/frontend`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Publish Directory: `dist`

### 12. Add Frontend Environment Variables 🔐
- [ ] Add `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com/api`
- [ ] Click "Create Static Site"
- [ ] Wait for deployment
- [ ] Copy your frontend URL

### 13. Update Backend CORS 🔗
- [ ] Go back to Render backend service
- [ ] Add environment variable:
  - [ ] `FRONTEND_URL` = `https://your-frontend-url.onrender.com`
- [ ] Save and redeploy backend

---

## Post-Deployment Testing ✅

### 14. Test Everything Works 🧪
- [ ] Open frontend URL in browser
- [ ] Register a new user account
- [ ] Login with credentials
- [ ] Check if seed products appear
- [ ] Create a new product with image
- [ ] Verify image uploaded successfully
- [ ] Edit a product
- [ ] Delete a product
- [ ] Logout and login again
- [ ] Register second user
- [ ] Verify both users see same products
- [ ] Test on mobile device

### 15. Monitor and Debug 🔍
- [ ] Check Render logs for errors
- [ ] Check MongoDB Atlas for data
- [ ] Check Cloudinary dashboard for uploads
- [ ] Test API endpoints directly using backend URL

---

## After Successful Deployment 🎉

### 16. Security Cleanup 🔒
- [ ] Set `AUTO_SEED=false` in Render environment variables
- [ ] Change JWT_SECRET to a strong random string
- [ ] Verify .env files are NOT in GitHub
- [ ] Enable MongoDB Atlas security features
- [ ] Review Cloudinary access controls

### 17. Documentation 📝
- [ ] Save all URLs somewhere safe:
  - [ ] Backend URL
  - [ ] Frontend URL
  - [ ] MongoDB Atlas login
  - [ ] Cloudinary login
- [ ] Document admin user credentials
- [ ] Share access details with team if needed

---

## Troubleshooting Common Issues 🆘

### Images Not Uploading
- [ ] Check Cloudinary credentials are correct
- [ ] Verify Cloudinary account is active
- [ ] Check Render logs for upload errors
- [ ] Ensure image size < 5MB

### Database Connection Failed
- [ ] Verify MongoDB Atlas connection string
- [ ] Check IP whitelist includes `0.0.0.0/0`
- [ ] Confirm database user credentials
- [ ] Test connection string locally

### CORS Errors
- [ ] Update `FRONTEND_URL` in backend env vars
- [ ] Redeploy backend after changing
- [ ] Clear browser cache

### Seed Data Not Appearing
- [ ] Set `AUTO_SEED=true` in Render
- [ ] Redeploy backend
- [ ] Check logs for seeding messages
- [ ] Manually run seed script if needed

---

## Success Criteria 🎯

Your deployment is successful when ALL of these are true:

✅ Backend connects to MongoDB Atlas  
✅ Auto-seeding populates initial products  
✅ Can upload product images from frontend  
✅ Images display correctly in product list  
✅ Multiple users see same product catalog  
✅ Each user has separate login session  
✅ All CRUD operations work (create, read, update, delete)  
✅ No errors in Render logs  
✅ App accessible from multiple devices  

---

## Resources & Links 🔗

- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Cloudinary:** https://cloudinary.com
- **Render Dashboard:** https://dashboard.render.com
- **Render Docs:** https://render.com/docs
- **MongoDB Docs:** https://docs.atlas.mongodb.com
- **Cloudinary Docs:** https://cloudinary.com/documentation

---

**Good luck with your deployment! Take it step by step and check off each item. 🚀**

If you get stuck, refer to `DEPLOYMENT_GUIDE.md` for detailed instructions.
