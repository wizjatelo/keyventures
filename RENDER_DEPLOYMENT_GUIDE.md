# LineMart Render Deployment Guide

This guide will help you deploy LineMart to Render with PostgreSQL database.

## Prerequisites

1. GitHub account
2. Render account (free tier available)
3. Git installed on your local machine

## Step 1: Prepare Your Repository

1. **Initialize Git repository** (if not already done):
   ```bash
   cd C:\Users\my pc\Desktop\linemart
   git init
   git add .
   git commit -m "Initial commit - LineMart application"
   ```

2. **Create GitHub repository**:
   - Go to GitHub and create a new repository named `linemart`
   - Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/linemart.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Connect GitHub to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the `linemart` repository

2. **Configure Environment Variables**:
   The render.yaml file will automatically create:
   - PostgreSQL database
   - Backend web service
   - Frontend static site

### Option B: Manual Setup

#### Backend Setup:

1. **Create PostgreSQL Database**:
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `linemart-db`
   - Database Name: `linemart`
   - User: `linemart_user`
   - Region: Oregon (or your preferred region)
   - Plan: Free

2. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select `linemart` repository
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `./build.sh`
   - Start Command: `gunicorn config.wsgi:application`

3. **Set Environment Variables**:
   ```
   DATABASE_URL: [Copy from PostgreSQL database]
   SECRET_KEY: [Generate a secure secret key]
   DEBUG: false
   PYTHON_VERSION: 3.11.0
   ```

#### Frontend Setup:

1. **Create Static Site**:
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Root Directory: `linemart-frontend`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `build`

2. **Set Environment Variables**:
   ```
   REACT_APP_API_URL: https://your-backend-service.onrender.com
   ```

## Step 3: Database Migration

After deployment, your database will be automatically migrated via the build script.

### Manual Migration (if needed):

1. **Access Render Shell**:
   - Go to your web service dashboard
   - Click "Shell" tab
   - Run migration commands:
   ```bash
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

2. **Create Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

## Step 4: Test Your Deployment

1. **Backend API**: `https://your-backend-service.onrender.com/admin/`
2. **Frontend**: `https://your-frontend-service.onrender.com`

### Test Endpoints:
- Login: `POST /member/auth/customer/login/`
- Register: `POST /member/auth/customer/register/`
- Password Reset: `POST /member/auth/password-reset/request/`

## Step 5: Configure Custom Domain (Optional)

1. Go to your service settings
2. Add custom domain
3. Update DNS records as instructed

## Environment Variables Reference

### Backend (.env):
```
SECRET_KEY=your-secret-key-here
DEBUG=false
DATABASE_URL=postgresql://user:password@host:port/database
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@linemart.com
RENDER_EXTERNAL_HOSTNAME=your-app.onrender.com
```

### Frontend (.env):
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in requirements.txt
   - Verify Python version compatibility

2. **Database Connection Issues**:
   - Verify DATABASE_URL is correctly set
   - Check PostgreSQL database is running
   - Ensure database user has proper permissions

3. **Static Files Not Loading**:
   - Run `python manage.py collectstatic`
   - Check STATIC_ROOT and STATIC_URL settings
   - Verify WhiteNoise is properly configured

4. **CORS Issues**:
   - Update CORS_ALLOWED_ORIGINS in settings.py
   - Add your frontend domain to allowed origins

### Logs:
- Backend logs: Render service dashboard → Logs tab
- Database logs: PostgreSQL dashboard → Logs tab

## Production Checklist

- [ ] SECRET_KEY is secure and unique
- [ ] DEBUG=False in production
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Email service configured
- [ ] Monitoring set up
- [ ] Error tracking configured

## Support

For issues:
1. Check Render documentation
2. Review Django deployment guides
3. Check application logs
4. Test locally first

## Next Steps

1. Set up monitoring and alerts
2. Configure automated backups
3. Set up CI/CD pipeline
4. Add error tracking (Sentry)
5. Configure email service for password resets