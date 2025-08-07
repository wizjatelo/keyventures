#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Starting LineMart backend build..."

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create static directory if it doesn't exist
mkdir -p static

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist
echo "Setting up admin user..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin', 
            email='admin@linemart.com', 
            password='admin123',
            role='admin'
        )
        print('Superuser created successfully')
    else:
        print('Superuser already exists')
except Exception as e:
    print(f'Error creating superuser: {e}')
"

echo "Build completed successfully!"