# backend/models.py
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash

def init_db(app):
    app.config["MONGO_URI"] = "mongodb://localhost:27017/petpal"
    mongo = PyMongo(app)
    return mongo

def create_user(mongo, name, email, password, role="user"):
    hashed_password = generate_password_hash(password)
    user_data = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role
    }
    mongo.db.users.insert_one(user_data)
    return user_data

def find_user(mongo, email):
    return mongo.db.users.find_one({"email": email})
