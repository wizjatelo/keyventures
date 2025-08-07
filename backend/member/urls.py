from django.urls import path
from .views import (
    register_user,
    create_manager,
    dashboard_view,
    manager_dashboard,
    password_reset_request,
    reset_password_confirm,
    # New password reset API endpoints
    password_reset_request_api,
    password_reset_confirm_api,
    password_reset_verify_token,
    cashier_dashboard,
    client_dashboard,
    # JWT Authentication endpoints
    customer_login,
    customer_register,
    cashier_login,
    manager_login,
    logout,
    refresh_token,
    # User management endpoints
    manage_users,
    manage_user_detail,
    reset_user_password,
    unlock_user_account,
    check_permissions
)

urlpatterns = [
    # ✅ Authentication Endpoints (JWT-based)
    path('auth/customer/login/', customer_login, name='customer-login'),
    path('auth/customer/register/', customer_register, name='customer-register'),
    path('auth/cashier/login/', cashier_login, name='cashier-login'),
    path('auth/manager/login/', manager_login, name='manager-login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/refresh/', refresh_token, name='refresh-token'),
    
    # ✅ Password Reset API Endpoints (matching frontend structure)
    path('auth/password-reset/request/', password_reset_request_api, name='password-reset-request-api'),
    path('auth/password-reset/confirm/', password_reset_confirm_api, name='password-reset-confirm-api'),
    path('auth/password-reset/verify/', password_reset_verify_token, name='password-reset-verify-api'),
    
    # ✅ User Management Endpoints (Manager only)
    path('users/', manage_users, name='manage-users'),
    path('users/<int:user_id>/', manage_user_detail, name='manage-user-detail'),
    path('users/<int:user_id>/reset-password/', reset_user_password, name='reset-user-password'),
    path('users/<int:user_id>/unlock/', unlock_user_account, name='unlock-user-account'),
    
    # ✅ Permission & Profile Endpoints
    path('permissions/', check_permissions, name='check-permissions'),
    
    # ✅ Legacy endpoints (for backward compatibility)
    path('register/', register_user, name='register'),
    path('password-reset/', password_reset_request, name='password-reset'),
    path('create-manager/', create_manager, name='create-manager'),
    path('reset-password/<uid>/<token>/', reset_password_confirm, name='password-reset-confirm'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('dashboard/manager/', manager_dashboard, name='manager-dashboard'),
    path('dashboard/cashier/', cashier_dashboard, name='cashier-dashboard'),
    path('dashboard/client/', client_dashboard, name='client-dashboard'),
]