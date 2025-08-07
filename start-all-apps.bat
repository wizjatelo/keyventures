@echo off
echo Starting LineMart Multi-Port System...
echo.

REM Start Backend (Port 8000)
echo Starting Backend API on port 8000...
start "Backend API" cmd /k "cd /d backend && venv\Scripts\activate && python manage.py runserver 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Customer App (Port 3001)
echo Starting Customer App on port 3001...
start "Customer App" cmd /k "cd /d customer-app && npm start"

REM Start Cashier App (Port 3002)
echo Starting Cashier App on port 3002...
start "Cashier App" cmd /k "cd /d cashier-app && npm start"

REM Start Manager App (Port 3003)
echo Starting Manager App on port 3003...
start "Manager App" cmd /k "cd /d manager-app && npm start"

echo.
echo All applications are starting...
echo.
echo Access URLs:
echo - Backend API: http://localhost:8000
echo - Customer Portal: http://localhost:3001
echo - Cashier Portal: http://localhost:3002
echo - Manager Portal: http://localhost:3003
echo.
echo Press any key to exit...
pause >nul