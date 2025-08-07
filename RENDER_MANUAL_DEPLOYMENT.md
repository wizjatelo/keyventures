# LineMart Manual Deployment Guide for Render

## 🚨 Blueprint Issue Resolution

The Blueprint deployment is having issues with directory structure. Let's deploy manually for guaranteed success.

## 🚀 Step-by-Step Manual Deployment

### Step 1: Deploy Backend (Web Service)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New" → "Web Service"**
3. **Connect GitHub Repository**: Select your `linemart` repository
4. **Configure Service**:
   - **Name**: `linemart-backend`
   - **Runtime**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn config.wsgi:application`
   - **Plan**: `Free`

5. **Environment Variables**:
   ```
   SECRET_KEY: [Click "Generate" for auto-generated key]
   DEBUG: false
   PYTHON_VERSION: 3.11.0
   ```

6. **Click "Create Web Service"**

### Step 2: Create PostgreSQL Database

1. **Click "New" → "PostgreSQL"**
2. **Configure Database**:
   - **Name**: `linemart-db`
   - **Database Name**: `linemart`
   - **User**: `linemart_user`
   - **Region**: `Oregon` (same as backend)
   - **Plan**: `Free`

3. **Click "Create Database"**

### Step 3: Connect Database to Backend

1. **Go to your backend service settings**
2. **Add Environment Variable**:
   - **Key**: `DATABASE_URL`
   - **Value**: Copy the "External Database URL" from your PostgreSQL database

3. **Save and redeploy backend**

### Step 4: Deploy Frontend (Static Site)

1. **Click "New" → "Static Site"**
2. **Connect GitHub Repository**: Select your `linemart` repository
3. **Configure Site**:
   - **Name**: `linemart-frontend`
   - **Root Directory**: `linemart-frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL: https://linemart-backend.onrender.com
   ```
   (Replace with your actual backend URL)

5. **Click "Create Static Site"**

## 🔧 Alternative Frontend Deployment

If the static site deployment fails, try this approach:

### Option A: Use Root Directory Build

1. **Create Static Site with these settings**:
   - **Root Directory**: Leave empty (use root)
   - **Build Command**: `cd linemart-frontend && npm ci && npm run build`
   - **Publish Directory**: `linemart-frontend/build`

### Option B: Manual Build Script

Create a build script in the root directory:

1. **Create `build-frontend.sh` in root**:
   ```bash
   #!/bin/bash
   cd linemart-frontend
   npm ci
   npm run build
   ```

2. **Use these settings**:
   - **Build Command**: `chmod +x build-frontend.sh && ./build-frontend.sh`
   - **Publish Directory**: `linemart-frontend/build`

## 📋 Deployment Checklist

### Backend Deployment:
- [ ] Web service created
- [ ] PostgreSQL database created
- [ ] DATABASE_URL environment variable set
- [ ] SECRET_KEY environment variable set
- [ ] DEBUG=false environment variable set
- [ ] Service is running (check logs)
- [ ] Admin panel accessible: `https://your-backend.onrender.com/admin/`

### Frontend Deployment:
- [ ] Static site created
- [ ] REACT_APP_API_URL environment variable set
- [ ] Build completed successfully
- [ ] Site is accessible
- [ ] Can communicate with backend

## 🧪 Testing Your Deployment

### 1. Test Backend API
```bash
# Health check
curl https://your-backend.onrender.com/admin/

# Test registration endpoint
curl -X POST https://your-backend.onrender.com/member/auth/customer/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "SecurePass123!",
    "role": "client"
  }'
```

### 2. Test Frontend
- Visit your frontend URL
- Try registration: `/customer/register`
- Try login: `/customer/login`
- Try password reset: `/forgot-password`

## 🔍 Troubleshooting

### Backend Issues:

1. **Build Fails**:
   - Check if `build.sh` is executable
   - Verify all packages in `requirements.txt`
   - Check Python version compatibility

2. **Database Connection Fails**:
   - Verify DATABASE_URL is correctly copied
   - Ensure PostgreSQL database is running
   - Check database user permissions

3. **Static Files Not Loading**:
   - Run `python manage.py collectstatic` manually
   - Check WhiteNoise configuration

### Frontend Issues:

1. **Build Fails**:
   - Check if all dependencies are in `package.json`
   - Verify Node.js version compatibility
   - Check for syntax errors in React code

2. **Can't Connect to Backend**:
   - Verify REACT_APP_API_URL is correct
   - Check CORS settings in Django
   - Ensure backend is running

## 📊 Expected Results

After successful deployment:

- **Backend URL**: `https://linemart-backend.onrender.com`
- **Frontend URL**: `https://linemart-frontend.onrender.com`
- **Admin Panel**: `https://linemart-backend.onrender.com/admin/`
- **Database**: Accessible via backend service

### Default Admin Credentials:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@linemart.com`

## 🎯 Success Indicators

✅ Backend service shows "Live" status
✅ PostgreSQL database shows "Available" status  
✅ Frontend static site shows "Live" status
✅ Admin panel loads without errors
✅ API endpoints respond correctly
✅ Frontend can register/login users
✅ Password reset functionality works

## 📞 Support

If you encounter issues:

1. **Check Service Logs**: Each service has a "Logs" tab with detailed error information
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Test Locally First**: Make sure everything works on your local machine
4. **Check File Permissions**: Ensure build scripts are executable

## 🚀 Next Steps After Deployment

1. **Custom Domain**: Add your own domain in service settings
2. **SSL Certificate**: Automatic with custom domains
3. **Monitoring**: Set up health checks and alerts
4. **Backups**: Configure database backups
5. **Scaling**: Upgrade to paid plans for better performance

This manual approach should resolve the directory structure issues you encountered with the Blueprint deployment!