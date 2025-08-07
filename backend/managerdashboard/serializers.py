from rest_framework import serializers
from .models import Manager, ApprovalRequest, AuditLog, ReportConfig
from member.models import CustomUser

class ManagerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = Manager
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'permissions', 'timezone', 'preferred_language'
        ]

class ApprovalRequestSerializer(serializers.ModelSerializer):
    requestor_name = serializers.CharField(source='requestor.username', read_only=True)
    manager_name = serializers.CharField(source='manager.username', read_only=True)
    
    class Meta:
        model = ApprovalRequest
        fields = [
            'id', 'type', 'target_id', 'requestor', 'requestor_name',
            'manager', 'manager_name', 'status', 'comment',
            'created_at', 'resolved_at'
        ]

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'username', 'action_type', 'target',
            'metadata', 'timestamp', 'source_ip'
        ]

class ReportConfigSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.user.username', read_only=True)
    
    class Meta:
        model = ReportConfig
        fields = [
            'id', 'manager', 'manager_name', 'name', 'metrics',
            'filters', 'schedule', 'export_format', 'last_run'
        ]