@echo off
echo Installing dependencies for all LineMart applications...
echo.

REM Install Customer App dependencies
echo Installing Customer App dependencies...
cd customer-app
call npm install
cd ..

REM Install Cashier App dependencies
echo Installing Cashier App dependencies...
cd cashier-app
call npm install
cd ..

REM Install Manager App dependencies
echo Installing Manager App dependencies...
cd manager-app
call npm install
cd ..

echo.
echo All dependencies installed successfully!
echo You can now run: start-all-apps.bat
echo.
pause