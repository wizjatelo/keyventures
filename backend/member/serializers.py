from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'is_active', 'is_approved', 'phone', 'profile_image',
            'loyalty_points', 'loyalty_tier', 'total_spent', 'last_visit',
            'store_id', 'cashier_secret_key', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'cashier_secret_key']
        extra_kwargs = {
            'password': {'write_only': True},
            'cashier_secret_key': {'read_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class PublicUserSerializer(serializers.ModelSerializer):
    """Serializer for public user information (no sensitive data)"""
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'first_name', 'last_name', 
            'role', 'profile_image'
        ]

class CustomerProfileSerializer(serializers.ModelSerializer):
    """Serializer for customer profile management"""
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone', 'profile_image', 'loyalty_points', 'loyalty_tier', 
            'total_spent', 'last_visit'
        ]
        read_only_fields = ['id', 'username', 'loyalty_points', 'loyalty_tier', 'total_spent', 'last_visit']

class StaffUserSerializer(serializers.ModelSerializer):
    """Serializer for cashier/manager user management"""
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'is_active', 'is_approved', 'phone', 'profile_image',
            'store_id', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'phone'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = CustomUser(**validated_data)
        user.set_password(password)
        
        # Set approval status based on role
        if validated_data.get('role') == 'cashier':
            user.is_approved = False  # Cashiers need approval
        else:
            user.is_approved = True
            
        user.save()
        return user