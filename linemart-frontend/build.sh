#!/bin/bash
# Frontend build script for Render

echo "🚀 Starting frontend build process..."

# Remove any existing node_modules and lock files to ensure clean install
echo "🧹 Cleaning up existing installations..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Install dependencies with npm (avoid yarn/npm conflicts)
echo "📦 Installing dependencies with npm..."
npm install

# Verify react-scripts is installed
echo "🔍 Verifying react-scripts installation..."
if [ -f "node_modules/.bin/react-scripts" ]; then
    echo "✅ react-scripts found"
else
    echo "❌ react-scripts not found, installing explicitly..."
    npm install react-scripts@5.0.1
fi

# Build the application
echo "🔨 Building React application..."
npm run build

echo "✅ Frontend build completed successfully!"
echo "📁 Build output is in the 'build' directory"