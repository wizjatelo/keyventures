from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from models import db, bcrypt, User

# Blueprint setup
auth_bp = Blueprint('auth', __name__)

# Sign-up route
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not all(k in data for k in ("name", "email", "password")):
        return jsonify(message="Missing required fields: name, email, password"), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    # Create new user instance
    user = User(name=data['name'], email=data['email'], password=hashed_password)

    try:
        db.session.add(user)
        db.session.commit()
        return jsonify(message="User created successfully"), 201
    except Exception as e:
        db.session.rollback()
        if "UNIQUE constraint" in str(e):  # Handle unique email constraint
            return jsonify(message="Email already exists"), 409
        return jsonify(message="Failed to create user", error=str(e)), 500

# Login route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ("email", "password")):
        return jsonify(message="Missing required fields: email, password"), 400

    # Find user by email
    user = User.query.filter_by(email=data['email']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        # Generate access token
        access_token = create_access_token(identity={"id": user.id, "email": user.email})
        return jsonify(access_token=access_token, message="Login successful"), 200

    return jsonify(message="Invalid credentials"), 401

# Protected route (example)
@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    return jsonify(message="This is a protected route"), 200
