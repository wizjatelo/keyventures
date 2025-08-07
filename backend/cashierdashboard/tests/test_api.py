import os
import sys
import django
from django.conf import settings

# Add project root directory to sys.path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from cashierdashboard.models import Category, Product
from django.contrib.auth.models import User

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def cashier_user(db):
    user = User.objects.create_user(username='cashier', password='password')
    user.is_staff = True
    user.save()
    return user

@pytest.fixture
def auth_client(api_client, cashier_user):
    api_client.force_authenticate(user=cashier_user)
    return api_client

@pytest.mark.django_db
def test_category_crud(auth_client):
    # Create category
    url = reverse('category-list')
    data = {'name': 'Electronics'}
    response = auth_client.post(url, data, format='json')
    assert response.status_code == 201
    category_id = response.data['id']

    # Retrieve category
    response = auth_client.get(reverse('category-detail', args=[category_id]))
    assert response.status_code == 200
    assert response.data['name'] == 'Electronics'

    # Update category
    data = {'name': 'Updated Electronics'}
    response = auth_client.put(reverse('category-detail', args=[category_id]), data, format='json')
    assert response.status_code == 200
    assert response.data['name'] == 'Updated Electronics'

    # Delete category
    response = auth_client.delete(reverse('category-detail', args=[category_id]))
    assert response.status_code == 204

@pytest.mark.django_db
def test_product_crud(auth_client):
    # Create category for product
    category = Category.objects.create(name='Books')

    # Create product
    url = reverse('product-list')
    data = {
        'name': 'Django for Beginners',
        'category': category.id,
        'price': '29.99',
        'stock_quantity': 10
    }
    response = auth_client.post(url, data, format='json')
    assert response.status_code == 201
    product_id = response.data['id']

    # Retrieve product
    response = auth_client.get(reverse('product-detail', args=[product_id]))
    assert response.status_code == 200
    assert response.data['name'] == 'Django for Beginners'

    # Update product
    data = {
        'name': 'Django for Pros',
        'category': category.id,
        'price': '39.99',
        'stock_quantity': 5
    }
    response = auth_client.put(reverse('product-detail', args=[product_id]), data, format='json')
    assert response.status_code == 200
    assert response.data['name'] == 'Django for Pros'

    # Delete product
    response = auth_client.delete(reverse('product-detail', args=[product_id]))
    assert response.status_code == 204
 