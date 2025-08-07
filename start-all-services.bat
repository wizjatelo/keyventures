@echo off
echo ========================================
echo    LineMart Multi-Port System Startup
echo ========================================
echo.

REM Start Backend API (Port 8000)
echo [1/4] Starting Backend API on port 8000...
start "LineMart Backend API" cmd /k "cd /d %~dp0 && start-backend.bat"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start Customer Portal (Port 3001)
echo [2/4] Starting Customer Portal on port 3001...
start "LineMart Customer Portal" cmd /k "cd /d %~dp0 && start-customer.bat"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Cashier Portal (Port 3002)
echo [3/4] Starting Cashier Portal on port 3002...
start "LineMart Cashier Portal" cmd /k "cd /d %~dp0 && start-cashier.bat"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Manager Portal (Port 3003)
echo [4/4] Starting Manager Portal on port 3003...
start "LineMart Manager Portal" cmd /k "cd /d %~dp0 && start-manager.bat"

echo.
echo ========================================
echo    All LineMart Services Starting...
echo ========================================
echo.
echo Please wait for all services to load completely.
echo This may take 1-2 minutes for the first startup.
echo.
echo Access URLs:
echo - Backend API:      http://localhost:8000
echo - Customer Portal:  http://localhost:3001
echo - Cashier Portal:   http://localhost:3002
echo - Manager Portal:   http://localhost:3003
echo.
echo ========================================
echo    Authentication Credentials
echo ========================================
echo.
echo Customer Portal (3001):
echo - Browse as guest (no login required)
echo - Or register a new customer account
echo.
echo Cashier Portal (3002):
echo - Username: cashier1
echo - Password: password123
echo.
echo Manager Portal (3003):
echo - Username: manager1
echo - Password: password123
echo.
echo ========================================
echo.
echo All services are starting in separate windows.
echo You can close this window once all services are loaded.
echo.
pause