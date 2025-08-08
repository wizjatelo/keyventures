#!/bin/bash
set -e

echo "Installing frontend dependencies..."
npm install

echo "Building React application..."
npm run build

echo "Frontend build completed successfully!"