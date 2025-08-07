from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    
    # Load base and instance-specific configurations
    app.config.from_object('config.Config')  # Base config app.config.from_object('instance.config.Config')

    app.config.from_pyfile('config.py', silent=True)  # Instance-specific config (in instance/ folder)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # Basic route
    @app.route('/')
    def home():
        return jsonify(message="Welcome to the Authentication API")

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
