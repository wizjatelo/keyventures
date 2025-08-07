from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# models.py

from app import db, bcrypt

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"User('{self.name}', '{self.email}')"

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)
 