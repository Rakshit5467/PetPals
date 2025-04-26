# backend/auth.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, verify_jwt_in_request, get_jwt_identity
from functools import wraps
from models import find_user, create_user
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            user = get_jwt_identity()
            if user.get("role") != role:
                return jsonify({"error": "Unauthorized, admin only"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    mongo = current_app.config["mongo"]
    user = find_user(mongo, email)
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Prepare user info without password for token payload
    user_data = {
        "email": user["email"],
        "role": user["role"],
        "name": user.get("name")
    }
    access_token = create_access_token(
        identity={
            "email": user["email"],
            "role": user["role"],
            "name": user.get("name")
        },
        additional_claims={
            "iss": "pet-pal-app",
            "aud": "pet-pal-users"
        }
    )
    return jsonify({"access_token": access_token, "role": user["role"]}), 200

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    mongo = current_app.config["mongo"]
    if mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    user = create_user(mongo, name, email, password, role="user")
    user_data = {
        "email": user["email"],
        "role": user["role"],
        "name": user["name"]
    }
    access_token = create_access_token(identity=user_data)
    return jsonify({"access_token": access_token, "role": user["role"]}), 201
