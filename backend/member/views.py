from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
import re
import jwt
from datetime import datetime, timedelta

from .serializers import RegisterSerializer
from .models import CustomUser
from .permissions import IsAdmin, IsManager, IsCashier, IsClient

# ✅ Password Policy Validation
def validate_password_policy(password):
    """Validate password against security policy"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not re.search(r'[0-9]', password):
        errors.append("Password must contain at least one number")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")
    
    return errors

# ✅ Rate Limiting Helper
def check_rate_limit(user, request):
    """Check if user has exceeded login attempts"""
    if user.is_account_locked():
        return False, "Account is temporarily locked due to too many failed attempts"
    
    if user.failed_login_attempts >= 5:
        user.lock_account(15)  # Lock for 15 minutes
        return False, "Too many failed attempts. Account locked for 15 minutes"
    
    return True, None

# ✅ JWT Token Generation
def generate_jwt_tokens(user):
    """Generate JWT access and refresh tokens"""
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['role'] = user.role
    refresh['permissions'] = get_user_permissions(user.role)
    
    # Set token expiry to 24 hours
    access_token = refresh.access_token
    access_token.set_exp(lifetime=timedelta(hours=24))
    
    return {
        'access': str(access_token),
        'refresh': str(refresh),
        'expires_in': 86400  # 24 hours in seconds
    }

# ✅ Get User Permissions
def get_user_permissions(role):
    """Get permissions based on user role"""
    role_permissions = {
        'CUSTOMER': [
            'view_products', 'add_to_cart', 'update_profile'
        ],
        'CASHIER': [
            'view_orders', 'update_order_status', 'process_payment', 
            'view_product_stock'
        ],
        'MANAGER': [
            'manage_users', 'view_all_orders', 'manage_products', 
            'update_inventory', 'generate_reports'
        ]
    }
    return role_permissions.get(role, [])

# ✅ User Registration
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """General user registration with password policy validation"""
    password = request.data.get('password')
    
    # Validate password policy
    if password:
        password_errors = validate_password_policy(password)
        if password_errors:
            return Response({
                'error': 'Password does not meet security requirements',
                'password_errors': password_errors
            }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        if user.role == 'CASHIER' and not user.is_approved:
            return Response({
                "message": "Registration successful. Await admin approval.",
                "cashier_key": user.cashier_secret_key,
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)

        # Generate JWT tokens
        tokens = generate_jwt_tokens(user)
        
        return Response({
            'tokens': tokens,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'permissions': get_user_permissions(user.role)
            },
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ Admin creates Manager
@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_manager(request):
    data = request.data.copy()
    data['role'] = 'manager'
    data['is_approved'] = True

    serializer = RegisterSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Manager created successfully.',
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ Legacy Login / Auth (Deprecated - Use JWT endpoints instead)
# This is kept for backward compatibility only

# ✅ Send Password Reset Email
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(email=email)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"

        print("🔗 Password Reset Link:", reset_link)

        send_mail(
            subject="Password Reset Request",
            message=f"Hi {user.username},\n\nClick the link to reset your password:\n{reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': 'Password reset email sent.'}, status=status.HTTP_200_OK)

    except CustomUser.DoesNotExist:
        return Response({'message': 'Password reset email sent if user exists.'}, status=status.HTTP_200_OK)

# ✅ Confirm Reset + Set New Password
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request, uid, token):
    try:
        uid_decoded = urlsafe_base64_decode(uid).decode()
        user = CustomUser.objects.get(pk=uid_decoded)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get('password')
        if not new_password:
            return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user.password = make_password(new_password)
        user.save()

        return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)

    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
        return Response({'error': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

# ✅ New Password Reset API Endpoints (matching frontend structure)
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_api(request):
    """Request password reset - matches frontend API structure"""
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(email=email)
        # Generate a simple token for the reset
        token = default_token_generator.make_token(user)
        
        # Store the token temporarily (in a real app, you'd use Redis or database)
        # For now, we'll use the Django token system
        reset_link = f"http://localhost:3000/reset-password?token={token}&uid={user.pk}"

        print("🔗 Password Reset Link:", reset_link)

        # In a real application, you would send an email here
        send_mail(
            subject="LineMart - Password Reset Request",
            message=f"Hi {user.username},\n\nClick the link to reset your password:\n{reset_link}\n\nThis link will expire in 24 hours for security reasons.\n\nIf you didn't request this reset, please ignore this email.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({
            'message': 'Password reset instructions have been sent to your email address.',
            'success': True
        }, status=status.HTTP_200_OK)

    except CustomUser.DoesNotExist:
        # Return success message even if user doesn't exist (security best practice)
        return Response({
            'message': 'Password reset instructions have been sent to your email address.',
            'success': True
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_api(request):
    """Confirm password reset with new password - matches frontend API structure"""
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not token:
        return Response({'error': 'Reset token is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not new_password:
        return Response({'error': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate password policy
    password_errors = validate_password_policy(new_password)
    if password_errors:
        return Response({
            'error': 'Password does not meet security requirements.',
            'password_errors': password_errors
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # In a simple implementation, we'll try to find the user by checking the token
        # This is a simplified approach - in production, you'd want a more robust system
        for user in CustomUser.objects.all():
            if default_token_generator.check_token(user, token):
                user.password = make_password(new_password)
                user.save()
                
                return Response({
                    'message': 'Password has been reset successfully.',
                    'success': True
                }, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': 'Failed to reset password. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_verify_token(request):
    """Verify if reset token is valid - matches frontend API structure"""
    token = request.data.get('token')
    
    if not token:
        return Response({'error': 'Reset token is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Check if token is valid for any user
        for user in CustomUser.objects.all():
            if default_token_generator.check_token(user, token):
                return Response({
                    'valid': True,
                    'message': 'Token is valid.'
                }, status=status.HTTP_200_OK)
        
        return Response({'error': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': 'Failed to verify token.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ✅ Role-Based Dashboards
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user
    role = user.role

    if role == 'admin':
        return admin_dashboard(request)
    elif role == 'manager':
        return manager_dashboard(request)
    elif role == 'cashier':
        return cashier_dashboard(request)
    elif role == 'client':
        return client_dashboard(request)
    else:
        return Response({'error': 'Unauthorized role'}, status=status.HTTP_403_FORBIDDEN)

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    return Response({'message': 'Welcome to the Admin dashboard.', 'username': request.user.username})

@api_view(['GET'])
@permission_classes([IsManager])
def manager_dashboard(request):
    return Response({'message': 'Welcome to the Manager dashboard.', 'username': request.user.username})

@api_view(['GET'])
@permission_classes([IsCashier])
def cashier_dashboard(request):
    return Response({'message': 'Welcome to the Cashier dashboard.', 'username': request.user.username})

@api_view(['GET'])
@permission_classes([IsClient])
def client_dashboard(request):
    return Response({'message': 'Welcome to the Client dashboard.', 'username': request.user.username})

# ✅ Role-Specific Login Endpoints with JWT and Security

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_login(request):
    """Customer-specific login endpoint with JWT"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find user by username or email
        user = CustomUser.objects.get(Q(username=username) | Q(email=username))
        
        # Check rate limiting
        rate_ok, rate_msg = check_rate_limit(user, request)
        if not rate_ok:
            return Response({'error': rate_msg}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Authenticate user
        if not check_password(password, user.password):
            user.failed_login_attempts += 1
            user.save()
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check role
        if user.role != 'CUSTOMER':
            return Response({'error': 'Access denied. Customer login required.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.last_login = timezone.now()
        user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.save()
        
        # Generate JWT tokens
        tokens = generate_jwt_tokens(user)
        
        return Response({
            'tokens': tokens,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'permissions': get_user_permissions(user.role),
                'interface_position': 'left',
                'accessible_dashboard': 'CustomerDashboard'
            },
            'redirect_to': '/customer/dashboard/',
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
        
    except CustomUser.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_register(request):
    """Customer registration endpoint with password policy"""
    data = request.data.copy()
    data['role'] = 'CUSTOMER'
    data['is_approved'] = True  # Customers are auto-approved
    
    password = data.get('password')
    if password:
        password_errors = validate_password_policy(password)
        if password_errors:
            return Response({
                'error': 'Password does not meet security requirements',
                'password_errors': password_errors
            }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = RegisterSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        tokens = generate_jwt_tokens(user)
        
        return Response({
            'tokens': tokens,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'permissions': get_user_permissions(user.role)
            },
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def cashier_login(request):
    """Cashier-specific login endpoint with secret key validation"""
    username = request.data.get('username')
    password = request.data.get('password')
    cashier_key = request.data.get('cashier_key')
    
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.get(Q(username=username) | Q(email=username))
        
        # Check rate limiting
        rate_ok, rate_msg = check_rate_limit(user, request)
        if not rate_ok:
            return Response({'error': rate_msg}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Authenticate user
        if not check_password(password, user.password):
            user.failed_login_attempts += 1
            user.save()
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check role
        if user.role != 'CASHIER':
            return Response({'error': 'Access denied. Cashier login required.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check approval status
        if not user.is_approved:
            return Response({'error': 'Cashier account not approved by admin'}, status=status.HTTP_403_FORBIDDEN)
        
        # Validate cashier secret key
        if user.cashier_secret_key and user.cashier_secret_key != cashier_key:
            user.failed_login_attempts += 1
            user.save()
            return Response({'error': 'Invalid cashier key'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.last_login = timezone.now()
        user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.save()
        
        # Generate JWT tokens
        tokens = generate_jwt_tokens(user)
        
        return Response({
            'tokens': tokens,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'permissions': get_user_permissions(user.role),
                'interface_position': 'center',
                'accessible_dashboard': 'CashierDashboard'
            },
            'redirect_to': '/cashier/dashboard/',
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
        
    except CustomUser.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def manager_login(request):
    """Manager-specific login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.get(Q(username=username) | Q(email=username))
        
        # Check rate limiting
        rate_ok, rate_msg = check_rate_limit(user, request)
        if not rate_ok:
            return Response({'error': rate_msg}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Authenticate user
        if not check_password(password, user.password):
            user.failed_login_attempts += 1
            user.save()
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check role
        if user.role != 'MANAGER':
            return Response({'error': 'Access denied. Manager login required.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check approval status
        if not user.is_approved:
            return Response({'error': 'Manager account not approved'}, status=status.HTTP_403_FORBIDDEN)
        
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.last_login = timezone.now()
        user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.save()
        
        # Generate JWT tokens
        tokens = generate_jwt_tokens(user)
        
        return Response({
            'tokens': tokens,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'permissions': get_user_permissions(user.role),
                'interface_position': 'right',
                'accessible_dashboard': 'ManagerDashboard'
            },
            'redirect_to': '/manager/dashboard/',
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
        
    except CustomUser.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Universal logout endpoint with token revocation"""
    try:
        # Get the refresh token from request
        refresh_token = request.data.get('refresh_token')
        
        if refresh_token:
            # Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Successfully logged out',
            'redirect_to': '/login/'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'message': 'Logout successful',
            'redirect_to': '/login/'
        }, status=status.HTTP_200_OK)

# ✅ Token Refresh Endpoint
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh JWT access token"""
    refresh_token = request.data.get('refresh_token')
    
    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh = RefreshToken(refresh_token)
        access_token = refresh.access_token
        access_token.set_exp(lifetime=timedelta(hours=24))
        
        return Response({
            'access': str(access_token),
            'expires_in': 86400
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

# ✅ User Management Endpoints (Manager Only)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_users(request):
    """User management endpoint for managers"""
    if not request.user.has_permission('manage_users'):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # Get users with filtering
        role_filter = request.GET.get('role')
        status_filter = request.GET.get('status')
        
        users = CustomUser.objects.all()
        
        if role_filter:
            users = users.filter(role=role_filter.upper())
        
        if status_filter == 'active':
            users = users.filter(is_active=True)
        elif status_filter == 'inactive':
            users = users.filter(is_active=False)
        
        user_data = []
        for user in users:
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'is_active': user.is_active,
                'is_approved': user.is_approved,
                'created_at': user.created_at,
                'last_login': user.last_login,
                'failed_login_attempts': user.failed_login_attempts
            })
        
        return Response({
            'users': user_data,
            'total': len(user_data)
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Create new user
        data = request.data.copy()
        
        # Validate password policy
        password = data.get('password')
        if password:
            password_errors = validate_password_policy(password)
            if password_errors:
                return Response({
                    'error': 'Password does not meet security requirements',
                    'password_errors': password_errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_user_detail(request, user_id):
    """Individual user management"""
    if not request.user.has_permission('manage_users'):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'PUT':
        # Update user
        data = request.data
        
        # Update allowed fields
        if 'role' in data:
            user.role = data['role'].upper()
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_approved' in data:
            user.is_approved = data['is_approved']
        
        user.save()
        
        return Response({
            'message': 'User updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'is_active': user.is_active,
                'is_approved': user.is_approved
            }
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        # Soft delete user
        user.is_active = False
        user.save()
        
        return Response({
            'message': 'User deactivated successfully'
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_user_password(request, user_id):
    """Reset user password (Manager only)"""
    if not request.user.has_permission('manage_users'):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    new_password = request.data.get('new_password')
    if not new_password:
        return Response({'error': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password policy
    password_errors = validate_password_policy(new_password)
    if password_errors:
        return Response({
            'error': 'Password does not meet security requirements',
            'password_errors': password_errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.password = make_password(new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    user.save()
    
    return Response({
        'message': 'Password reset successfully'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unlock_user_account(request, user_id):
    """Unlock user account (Manager only)"""
    if not request.user.has_permission('manage_users'):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    user.unlock_account()
    
    return Response({
        'message': 'Account unlocked successfully'
    }, status=status.HTTP_200_OK)

# ✅ Permission Check Endpoint
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_permissions(request):
    """Check user permissions"""
    user = request.user
    permissions = get_user_permissions(user.role)
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'permissions': permissions,
            'interface_position': {
                'CUSTOMER': 'left',
                'CASHIER': 'center', 
                'MANAGER': 'right'
            }.get(user.role, 'left'),
            'accessible_dashboard': f"{user.role.title()}Dashboard"
        }
    }, status=status.HTTP_200_OK)
