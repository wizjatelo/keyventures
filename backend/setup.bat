@echo off
echo Setting up LineMart Backend...

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install django djangorestframework django-cors-headers dj-rest-auth django-allauth

REM Make migrations
echo Making migrations...
python manage.py makemigrations member
python manage.py makemigrations customerdashboard
python manage.py makemigrations cashierdashboard
python manage.py makemigrations managerdashboard

REM Apply migrations
echo Applying migrations...
python manage.py migrate

REM Ask to create superuser
set /p create_superuser="Create superuser? (y/n): "
if /i "%create_superuser%"=="y" (
    python manage.py createsuperuser
)

REM Ask to populate database
set /p populate_data="Populate database with sample data? (y/n): "
if /i "%populate_data%"=="y" (
    python manage.py populate_customer_data
)

echo Setup completed successfully!
echo To start the server, run: python manage.py runserver@echo off
echo Setting up LineMart Backend...

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install django djangorestframework django-cors-headers dj-rest-auth django-allauth

REM Make migrations
echo Making migrations...
python manage.py makemigrations member
python manage.py makemigrations customerdashboard
python manage.py makemigrations cashierdashboard
python manage.py makemigrations managerdashboard

REM Apply migrations
echo Applying migrations...
python manage.py migrate

REM Ask to create superuser
set /p create_superuser="Create superuser? (y/n): "
if /i "%create_superuser%"=="y" (
    python manage.py createsuperuser
)

REM Ask to populate database
set /p populate_data="Populate database with sample data? (y/n): "
if /i "%populate_data%"=="y" (
    python manage.py populate_customer_data
)

echo Setup completed successfully!
echo To start the server, run: python manage.py runserver