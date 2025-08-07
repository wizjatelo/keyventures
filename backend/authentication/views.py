from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password, check_password
from member.models import CustomUser
from django.utils import timezone
import json

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_login(request):
    """
    Customer login endpoint - only allows customer role access
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Try to find customer user
        try:
            custom_user = CustomUser.objects.get(email=email, role='customer')
            
            # Check password (use Django's built-in authentication)
            user = authenticate(username=custom_user.username, password=password)
            if user and user.role == 'customer':
                # Update last visit
                custom_user.last_visit = timezone.now()
                custom_user.save()
                
                # Create or get token
                token, created = Token.objects.get_or_create(user=custom_user)
                
                return Response({
                    'token': token.key,
                    'user': {
                        'id': custom_user.id,
                        'username': custom_user.username,
                        'email': custom_user.email,
                        'first_name': custom_user.first_name,
                        'last_name': custom_user.last_name,
                        'role': 'customer',
                        'loyalty_points': custom_user.loyalty_points,
                        'loyalty_tier': custom_user.loyalty_tier,
                        'total_spent': str(custom_user.total_spent)
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid customer credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Invalid customer credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': 'Login failed: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def cashier_login(request):
    """
    Cashier login endpoint - only allows cashier role access
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        if user and user.role == 'cashier' and user.is_approved:
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': 'cashier',
                    'store_id': user.store_id,
                    'cashier_secret_key': user.cashier_secret_key
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid cashier credentials or account not approved'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': 'Login failed: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def manager_login(request):
    """
    Manager login endpoint - only allows manager role access
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        if user and user.role == 'manager' and user.is_approved:
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': 'manager',
                    'store_id': user.store_id
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid manager credentials or account not approved'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': 'Login failed: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_register(request):
    """
    Customer registration endpoint
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        
        if not username or not email or not password:
            return Response({
                'error': 'Username, email, and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if CustomUser.objects.filter(username=username).exists():
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if CustomUser.objects.filter(email=email).exists():
            return Response({
                'error': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new customer user with hashed password
        custom_user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='customer',
            is_active=True
        )
        
        # Create token
        token, created = Token.objects.get_or_create(user_id=custom_user.id)
        
        return Response({
            'token': token.key,
            'user': {
                'id': custom_user.id,
                'username': custom_user.username,
                'email': custom_user.email,
                'first_name': custom_user.first_name,
                'last_name': custom_user.last_name,
                'role': 'customer'
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'Registration failed: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def logout_view(request):
    """
    Logout endpoint for all roles
    """
    try:
        # Delete the user's token
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        
        return Response({
            'message': 'Successfully logged out'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Logout failed: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# User Management Endpoints

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get current user profile
    """
    try:
        user = request.user
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'phone': user.phone,
                'loyalty_points': user.loyalty_points if user.role == 'customer' else None,
                'loyalty_tier': user.loyalty_tier if user.role == 'customer' else None,
                'total_spent': str(user.total_spent) if user.role == 'customer' else None,
                'store_id': user.store_id if user.role in ['cashier', 'manager'] else None,
                'is_approved': user.is_approved,
                'last_login': user.last_login,
                'date_joined': user.date_joined
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Failed to get profile: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update current user profile
    """
    try:
        user = request.user
        data = json.loads(request.body)
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'email' in data and data['email'] != user.email:
            # Check if email already exists
            if CustomUser.objects.filter(email=data['email']).exclude(id=user.id).exists():
                return Response({
                    'error': 'Email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            user.email = data['email']
        
        user.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to update profile: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    try:
        user = request.user
        data = json.loads(request.body)
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return Response({
                'error': 'Current password and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check current password
        if not user.check_password(current_password):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # Delete all tokens to force re-login
        Token.objects.filter(user=user).delete()
        
        return Response({
            'message': 'Password changed successfully. Please login again.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to change password: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Admin/Manager User Management

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """
    List users (Manager/Admin only)
    """
    try:
        if request.user.role not in ['manager', 'admin']:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        role_filter = request.GET.get('role', None)
        users = CustomUser.objects.all()
        
        if role_filter:
            users = users.filter(role=role_filter)
        
        users_data = []
        for user in users:
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active,
                'is_approved': user.is_approved,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
                'store_id': user.store_id if user.role in ['cashier', 'manager'] else None
            })
        
        return Response({
            'users': users_data,
            'total': len(users_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to list users: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_staff_user(request):
    """
    Create cashier/manager user (Admin/Manager only)
    """
    try:
        if request.user.role not in ['manager', 'admin']:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        store_id = data.get('store_id', None)
        
        if not all([username, email, password, role]):
            return Response({
                'error': 'Username, email, password, and role are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if role not in ['cashier', 'manager']:
            return Response({
                'error': 'Role must be cashier or manager'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if CustomUser.objects.filter(username=username).exists():
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if CustomUser.objects.filter(email=email).exists():
            return Response({
                'error': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new staff user
        staff_user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            store_id=store_id,
            is_active=True,
            is_approved=True
        )
        
        return Response({
            'message': f'{role.title()} user created successfully',
            'user': {
                'id': staff_user.id,
                'username': staff_user.username,
                'email': staff_user.email,
                'first_name': staff_user.first_name,
                'last_name': staff_user.last_name,
                'role': staff_user.role,
                'store_id': staff_user.store_id
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'Failed to create user: ' + str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)