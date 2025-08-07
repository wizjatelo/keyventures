@echo off
echo Setting up LineMart...

REM Setup backend
echo Setting up backend...
cd backend
call setup.bat
cd ..

REM Setup frontend
echo Setting up frontend...
cd linemart-frontend
call setup.bat
cd ..

echo Setup completed successfully!
echo To start the backend server, run: cd backend && python manage.py runserver
echo To start the frontend server, run: cd linemart-frontend && npm start@echo off
echo Setting up LineMart...

REM Setup backend
echo Setting up backend...
cd backend
call setup.bat
cd ..

REM Setup frontend
echo Setting up frontend...
cd linemart-frontend
call setup.bat
cd ..

echo Setup completed successfully!
echo To start the backend server, run: cd backend && python manage.py runserver
echo To start the frontend server, run: cd linemart-frontend && npm start