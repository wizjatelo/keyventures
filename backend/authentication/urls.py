from django.urls import path
from member.views import (
    customer_login, customer_register, cashier_login, manager_login, logout,
    password_reset_request, reset_password_confirm
)

urlpatterns = [
    # Role-specific authentication endpoints
    path('customer/login/', customer_login, name='customer-login'),
    path('customer/register/', customer_register, name='customer-register'),
    path('cashier/login/', cashier_login, name='cashier-login'),
    path('manager/login/', manager_login, name='manager-login'),
    
    # Common endpoints
    path('logout/', logout, name='logout'),
    
    # Password reset
    path('password-reset/', password_reset_request, name='password-reset'),
    path('password-reset-confirm/<str:uid>/<str:token>/', reset_password_confirm, name='password-reset-confirm'),
]