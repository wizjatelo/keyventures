#!/bin/bash
set -e

echo "🚀 Starting LineMart deployment build..."

# Check if we're building frontend or backend
if [ "$1" = "frontend" ]; then
    echo "📦 Building frontend..."
    cd linemart-frontend
    npm install
    npm run build
    echo "✅ Frontend build completed!"
elif [ "$1" = "backend" ]; then
    echo "🐍 Building backend..."
    cd backend
    pip install --upgrade pip
    pip install -r requirements.txt
    python manage.py collectstatic --no-input
    python manage.py migrate
    echo "✅ Backend build completed!"
else
    echo "📦 Building frontend (default)..."
    cd linemart-frontend
    npm install
    npm run build
    echo "✅ Frontend build completed!"
fi