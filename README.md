# LineMart E-commerce Platform

LineMart is a multi-component e-commerce application with separate frontend and backend services.

## Project Structure

- **linemart-frontend**: React-based frontend application with user interfaces for different roles
- **backend**: Django REST API with multiple dashboard modules for different user roles
- **my-auth-backend**: Flask-based authentication service

## Setup Instructions

### Backend (Django)

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin  # Linux/Mac
   ```

3. Install dependencies:
   ```
   pip install django djangorestframework django-cors-headers dj-rest-auth django-allauth
   ```

4. Run the database setup script:
   ```
   python setup_database.py
   ```
   - This will create the necessary database tables
   - You'll be prompted to create a superuser
   - You can also populate the database with sample data

5. Start the Django development server:
   ```
   python manage.py runserver
   ```
   The API will be available at http://localhost:8000/api/

### Frontend (React)

1. Navigate to the frontend directory:
   ```
   cd linemart-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The frontend will be available at http://localhost:3000/

## API Endpoints

### Customer Dashboard API

- **Profile**: `/api/customer/profile/`
- **Dashboard Stats**: `/api/customer/dashboard-stats/`
- **Products**: `/api/customer/products/`
- **Product Categories**: `/api/customer/products/categories/`
- **Orders**: `/api/customer/orders/`
- **Payment Methods**: `/api/customer/payment-methods/`
- **Notifications**: `/api/customer/notifications/`
- **Deals**: `/api/customer/deals/`
- **Promo Banners**: `/api/customer/promo-banners/`

### Authentication API

- **Login**: `/api/auth/login/`
- **Register**: `/api/auth/registration/`
- **Logout**: `/api/auth/logout/`

## User Roles

- **Admin**: Full access to all features
- **Manager**: Access to manager dashboard
- **Cashier**: Access to cashier dashboard
- **Client**: Access to customer dashboard

## Database

The application uses SQLite as the database, which is included with Django. The database file is located at `backend/db.sqlite3`.

## Testing

To run tests for the backend:
```
cd backend
python manage.py test
```

To run tests for the frontend:
```
cd linemart-frontend
npm test
```# LineMart E-commerce Platform

LineMart is a multi-component e-commerce application with separate frontend and backend services.

## Project Structure

- **linemart-frontend**: React-based frontend application with user interfaces for different roles
- **backend**: Django REST API with multiple dashboard modules for different user roles
- **my-auth-backend**: Flask-based authentication service

## Setup Instructions

### Backend (Django)

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin  # Linux/Mac
   ```

3. Install dependencies:
   ```
   pip install django djangorestframework django-cors-headers dj-rest-auth django-allauth
   ```

4. Run the database setup script:
   ```
   python setup_database.py
   ```
   - This will create the necessary database tables
   - You'll be prompted to create a superuser
   - You can also populate the database with sample data

5. Start the Django development server:
   ```
   python manage.py runserver
   ```
   The API will be available at http://localhost:8000/api/

### Frontend (React)

1. Navigate to the frontend directory:
   ```
   cd linemart-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The frontend will be available at http://localhost:3000/

## API Endpoints

### Customer Dashboard API

- **Profile**: `/api/customer/profile/`
- **Dashboard Stats**: `/api/customer/dashboard-stats/`
- **Products**: `/api/customer/products/`
- **Product Categories**: `/api/customer/products/categories/`
- **Orders**: `/api/customer/orders/`
- **Payment Methods**: `/api/customer/payment-methods/`
- **Notifications**: `/api/customer/notifications/`
- **Deals**: `/api/customer/deals/`
- **Promo Banners**: `/api/customer/promo-banners/`

### Authentication API

- **Login**: `/api/auth/login/`
- **Register**: `/api/auth/registration/`
- **Logout**: `/api/auth/logout/`

## User Roles

- **Admin**: Full access to all features
- **Manager**: Access to manager dashboard
- **Cashier**: Access to cashier dashboard
- **Client**: Access to customer dashboard

## Database

The application uses SQLite as the database, which is included with Django. The database file is located at `backend/db.sqlite3`.

## Testing

To run tests for the backend:
```
cd backend
python manage.py test
```

To run tests for the frontend:
```
cd linemart-frontend
npm test
```