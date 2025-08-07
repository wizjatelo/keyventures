#!/bin/bash
# Frontend deployment script for Render

echo "🚀 Starting frontend build..."

# Navigate to frontend directory
cd linemart-frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building React application..."
npm run build

echo "✅ Frontend build completed!"
echo "📁 Build files are in: linemart-frontend/build/"