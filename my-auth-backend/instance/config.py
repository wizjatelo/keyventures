# instance/config.py
class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = '3348'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:wizjatelo@localhost:5432/yourdbname'
    JWT_SECRET_KEY = '3348'
