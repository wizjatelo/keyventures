@echo off
echo Starting Backend API on Port 8000...
cd backend
call venv\Scripts\activate
python manage.py runserver 8000