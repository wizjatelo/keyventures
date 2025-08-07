import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key')  # General secret key
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://postgres:wizjatelo@localhost:5432/yourdbname'
    )  # Fallback database
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-jwt-secret')  # JWT secret key


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DEV_DATABASE_URL',
        'postgresql://postgres:wizjatelo@localhost:5432/yourdbname'
    )  # Development-specific database


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')  # Production database
