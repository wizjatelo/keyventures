from django.conf import settings
from django.db import models

# Import shared models from cashierdashboard
# Note: Store, Transaction, and other core models are defined in cashierdashboard

class Manager(models.Model):
    """Manager-specific profile extending CustomUser"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=[
        ('store_manager', 'Store Manager'),
        ('area_manager', 'Area Manager'),
        ('admin', 'Admin')
    ])
    permissions = models.JSONField(default=dict)
    timezone = models.CharField(max_length=50, default='UTC')
    preferred_language = models.CharField(max_length=10, default='en')

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class ApprovalRequest(models.Model):
    type = models.CharField(max_length=20, choices=[
        ('transaction_void', 'Transaction Void'),
        ('discount_approval', 'Discount Approval'),
        ('return_approval', 'Return Approval'),
        ('inventory_transfer', 'Inventory Transfer')
    ])
    target_id = models.IntegerField()
    requestor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='requests_made')
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='requests_handled')
    status = models.CharField(max_length=20, default='pending')
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.type} - {self.status}"

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=50)
    target = models.CharField(max_length=100)
    metadata = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    source_ip = models.GenericIPAddressField(null=True)

    def __str__(self):
        return f"{self.user.username} - {self.action_type}"

class ReportConfig(models.Model):
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    metrics = models.JSONField(default=list)
    filters = models.JSONField(default=dict)
    schedule = models.CharField(max_length=50, blank=True)
    export_format = models.CharField(max_length=10, default='pdf')
    last_run = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
 