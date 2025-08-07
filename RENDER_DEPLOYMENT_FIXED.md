# LineMart Render Deployment Guide - FIXED

## 🚨 Issue Resolution

The deployment error was caused by incorrect directory structure in the render.yaml file. This has been fixed.

## 🚀 Deployment Options

### Option 1: Separate Services (Recommended)

Deploy backend and frontend as separate services for better control.

#### Step 1: Deploy Backend

1. **Create Web Service in Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn config.wsgi:application`

2. **Create PostgreSQL Database**:
   - Click "New" → "PostgreSQL"
   - **Name**: `linemart-db`
   - **Database Name**: `linemart`
   - **User**: `linemart_user`
   - **Region**: Oregon
   - **Plan**: Free

3. **Set Backend Environment Variables**:
   ```
   DATABASE_URL: [Copy from PostgreSQL database connection string]
   SECRET_KEY: [Generate a secure 50-character secret key]
   DEBUG: false
   PYTHON_VERSION: 3.11.0
   RENDER_EXTERNAL_HOSTNAME: [Your backend service URL]
   ```

#### Step 2: Deploy Frontend

1. **Create Static Site in Render**:
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - **Root Directory**: `linemart-frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `build`

2. **Set Frontend Environment Variables**:
   ```
   REACT_APP_API_URL: https://your-backend-service.onrender.com
   ```

### Option 2: Blueprint Deployment

Use the updated render.yaml file in the root directory.

1. **Deploy via Blueprint**:
   - Go to Render Dashboard
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the root directory (contains render.yaml)

## 🔧 Manual Fixes if Needed

### If Frontend Build Fails:

1. **Check package.json location**:
   ```bash
   # Should be in linemart-frontend/package.json
   ls linemart-frontend/package.json
   ```

2. **Update build command if needed**:
   ```bash
   cd linemart-frontend && npm ci && npm run build
   ```

### If Backend Build Fails:

1. **Make build.sh executable**:
   ```bash
   chmod +x backend/build.sh
   ```

2. **Test build locally**:
   ```bash
   cd backend
   ./build.sh
   ```

## 📋 Environment Variables Reference

### Backend (.env):
```bash
# Required
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-50-character-secret-key-here

# Optional
DEBUG=false
PYTHON_VERSION=3.11.0
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@linemart.com
RENDER_EXTERNAL_HOSTNAME=your-backend.onrender.com
```

### Frontend (.env):
```bash
REACT_APP_API_URL=https://your-backend-service.onrender.com
```

## 🧪 Testing Deployment

### 1. Backend Health Check:
- Visit: `https://your-backend.onrender.com/admin/`
- Should show Django admin login

### 2. API Endpoints Test:
```bash
# Test registration
curl -X POST https://your-backend.onrender.com/member/auth/customer/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!","role":"client"}'

# Test login
curl -X POST https://your-backend.onrender.com/member/auth/customer/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}'
```

### 3. Frontend Test:
- Visit: `https://your-frontend.onrender.com`
- Test registration and login flows

## 🔍 Troubleshooting

### Common Issues:

1. **"package.json not found"**:
   - ✅ Fixed: Added `rootDir: linemart-frontend` to render.yaml
   - Ensure frontend service points to correct directory

2. **"build.sh permission denied"**:
   - ✅ Fixed: Updated build script with proper error handling
   - Make sure build.sh is executable

3. **Database connection errors**:
   - Verify DATABASE_URL is correctly set
   - Check PostgreSQL database is running
   - Ensure database user has proper permissions

4. **Static files not loading**:
   - ✅ Fixed: Added static directory creation to build script
   - Verify WhiteNoise is properly configured

5. **CORS errors**:
   - Update CORS_ALLOWED_ORIGINS in Django settings
   - Add your frontend domain to allowed origins

### Debug Steps:

1. **Check Render Logs**:
   - Go to service dashboard → Logs tab
   - Look for specific error messages

2. **Verify File Structure**:
   ```
   linemart/
   ├── backend/
   │   ├── manage.py
   │   ├── requirements.txt
   │   ├── build.sh
   │   └── render.yaml
   ├── linemart-frontend/
   │   ├── package.json
   │   ├── src/
   │   └── render.yaml
   └── render.yaml (root)
   ```

3. **Test Locally First**:
   ```bash
   # Backend
   cd backend
   python manage.py runserver

   # Frontend
   cd linemart-frontend
   npm start
   ```

## ✅ Success Checklist

- [ ] Backend service deployed and accessible
- [ ] PostgreSQL database created and connected
- [ ] Frontend static site deployed
- [ ] Environment variables configured
- [ ] API endpoints responding
- [ ] Frontend can communicate with backend
- [ ] Registration and login working
- [ ] Password reset functionality working

## 🎯 Expected URLs

After successful deployment:
- **Backend API**: `https://linemart-backend.onrender.com`
- **Frontend**: `https://linemart-frontend.onrender.com`
- **Admin Panel**: `https://linemart-backend.onrender.com/admin/`

## 📞 Support

If you encounter issues:
1. Check the specific error in Render logs
2. Verify all environment variables are set
3. Test the problematic component locally
4. Check file permissions and directory structure
5. Ensure all dependencies are in requirements.txt/package.json

The deployment should now work correctly with the fixed configuration! 🚀