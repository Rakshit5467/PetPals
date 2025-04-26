from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt_identity,
    create_access_token,
    get_jwt
)
from bson.objectid import ObjectId
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from models import init_db, create_user, find_user
from auth import auth_bp, role_required

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 86400
    }
})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '86400')
    return response

# --- Configuration
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "super-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False 
app.config["JWT_SUBJECT_CLAIM"] = None 
app.config["JWT_IDENTITY_CLAIM"] = "identity"  
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# --- Initialize MongoDB
mongo = init_db(app)
app.config["mongo"] = mongo

# --- Initialize JWT
jwt = JWTManager(app)

@jwt.additional_claims_loader
def add_additional_claims(identity):
    return {
        "iss": "pet-pal-app",
        "aud": "pet-pal-users",
        "identity": identity
    }

@jwt.token_verification_loader
def custom_token_verification(jwt_header, jwt_data):
    jwt_data.pop('sub', None)
    return jwt_data

# --- Register authentication blueprint
app.register_blueprint(auth_bp, url_prefix="/api")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.before_request
def log_request():
    print(f"\nIncoming {request.method} {request.path}")
    print("Headers:", dict(request.headers))
    print("JSON:", request.get_json(silent=True))

# --- User Endpoints ---

@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    return jsonify(get_jwt_identity()), 200

@app.route('/api/pet-listing', methods=['POST'])
@jwt_required()
def add_pet_listing():
    # Check if the request contains form data
    if not request.form:
        return jsonify({"error": "No form data received"}), 400

    # Get form data
    data = request.form
    required_fields = ["name", "species", "age", "description", "ownerName", "phone", "street", "city", "state", "postalCode"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Validate string fields
    string_fields = ["name", "species", "description"]
    for field in string_fields:
        if not isinstance(data.get(field), str) or not data[field].strip():
            return jsonify({"error": f"{field} must be a non-empty string"}), 422

    # Validate age
    try:
        age = int(data["age"])
        if age <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "Age must be a positive integer"}), 422

    # Validate phone
    if not data["phone"].isdigit() or len(data["phone"]) != 10:
        return jsonify({"error": "Phone must be 10 digits"}), 422

    # Check if image file exists
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({"error": "No selected image file"}), 400

    if not allowed_file(image_file.filename):
        return jsonify({"error": "Invalid file type. Allowed types: png, jpg, jpeg, gif"}), 400

    # Save the image file
    try:
        filename = secure_filename(image_file.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        image_file.save(image_path)
        image_url = f"/uploads/{filename}"
    except Exception as e:
        return jsonify({"error": f"Failed to save image: {str(e)}"}), 500

    user = get_jwt_identity()
    listing = {
        "name": data["name"],
        "species": data["species"],
        "age": age,
        "description": data["description"],
        "image": image_url,
        "owner": user["email"],
        "owner_contact": {
            "name": data["ownerName"],
            "phone": data["phone"],
            
            "address": {
                "street": data["street"],
                "city": data["city"],
                "state": data["state"],
                "postal_code": data["postalCode"]
            }
        },
        "status": "Available",
        "adoption_requests": [],
        "created_at": datetime.utcnow()
    }
    
    try:
        result = mongo.db.pet_listings.insert_one(listing)
        listing["_id"] = str(result.inserted_id)
        return jsonify({
            "message": "Pet listing created successfully!",
            "listing": listing
        }), 201
    except Exception as e:
        if os.path.exists(image_path):
            os.remove(image_path)
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/pet-listings', methods=['GET'])
def get_pet_listings():
    listings = list(mongo.db.pet_listings.find({"status": {"$in": ["Available", "Pending"]}}))
    for pet in listings:
        pet["_id"] = str(pet["_id"])
        # Construct full image URL
        if pet["image"].startswith('/uploads/'):
            pet["image"] = f"http://{request.host}{pet['image']}"
    return jsonify(listings), 200

@app.route('/api/adoption-request', methods=['POST', 'OPTIONS'])
@jwt_required()
def send_adoption_request():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        # Required fields validation
        required_fields = [
            "pet_listing_id", "contact", "address", "city", 
            "state", "postalCode", "homeType", "hoursAlone",
            "petExperience", "adoptionReason"
        ]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing": missing_fields
            }), 400

        user = get_jwt_identity()
        
        try:
            pet_listing_id = ObjectId(data["pet_listing_id"])
        except:
            return jsonify({"error": "Invalid pet listing ID format"}), 400

        # Check if pet exists
        pet = mongo.db.pet_listings.find_one({"_id": pet_listing_id})
        if not pet:
            return jsonify({"error": "Pet listing not found"}), 404
            
        if pet["status"] == "Adopted":
            return jsonify({"error": "This pet has already been adopted"}), 400

        # Check for existing request
        existing_request = next(
            (req for req in pet.get("adoption_requests", []) 
             if req.get("requester_id") == user["email"] and req.get("status") == "Pending"),
            None
        )
        if existing_request:
            return jsonify({
                "error": "You already have a pending request for this pet",
                "request_id": existing_request.get("_id")
            }), 400

        # Create adoption request
        adoption_request = {
            "_id": str(ObjectId()),
            "requester_id": user["email"],
            "requester_name": user.get("name", ""),
            "contact_info": {
                "phone": data["contact"],
                "address": {
                    "street": data["address"],
                    "city": data["city"],
                    "state": data["state"],
                    "postal_code": data["postalCode"]
                }
            },
            "home_info": {
                "type": data["homeType"],
                "yard_size": data.get("yardSize", ""),
                "hours_alone": data["hoursAlone"]
            },
            "experience": {
                "other_pets": data.get("otherPets", ""),
                "previous_experience": data["petExperience"]
            },
            "reason": data["adoptionReason"],
            "status": "Pending",
            "request_date": datetime.utcnow()
        }

        # Update database
        result = mongo.db.pet_listings.update_one(
            {"_id": pet_listing_id},
            {
                "$push": {"adoption_requests": adoption_request},
                "$set": {"status": "Pending"} if pet["status"] == "Available" else {}
            }
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Failed to submit adoption request"}), 400

        return jsonify({
            "message": "Adoption request submitted!",
            "request": adoption_request,
            "pet_listing_id": str(pet_listing_id)
        }), 201

    except Exception as e:
        print(f"Error in send_adoption_request: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e) if app.debug else None
        }), 500

@app.route('/api/my-pet-listings', methods=['GET'])
@jwt_required()
def get_my_pet_listings():
    user = get_jwt_identity()
    listings = list(mongo.db.pet_listings.find({"owner": user["email"]}))
    for pet in listings:
        pet["_id"] = str(pet["_id"])
        if pet["image"].startswith('/uploads/'):
            pet["image"] = f"http://{request.host}{pet['image']}"
    return jsonify(listings), 200

@app.route('/api/adoption-request/<string:pet_listing_id>/<string:request_id>', methods=['PUT'])
@jwt_required()
def update_adoption_request(pet_listing_id, request_id):
    try:
        data = request.get_json()
        if not data or "status" not in data:
            return jsonify({"error": "Missing status in request body"}), 400

        # Validate status
        if data["status"] not in ["Approved", "Rejected"]:
            return jsonify({"error": "Invalid status value"}), 400

        # Convert IDs to ObjectId
        try:
            pet_listing_obj_id = ObjectId(pet_listing_id)
        except:
            return jsonify({"error": "Invalid pet listing ID format"}), 400

        user = get_jwt_identity()
        pet = mongo.db.pet_listings.find_one({"_id": pet_listing_obj_id})
        
        if not pet:
            return jsonify({"error": "Pet listing not found"}), 404

        # Verify pet owner
        if pet["owner"] != user["email"]:
            return jsonify({"error": "Unauthorized to modify this listing"}), 403

        # Find the request to update
        request_exists = False
        for req in pet.get("adoption_requests", []):
            if req["_id"] == request_id:
                request_exists = True
                break

        if not request_exists:
            return jsonify({"error": "Adoption request not found"}), 404

        # Update the request status
        result = mongo.db.pet_listings.update_one(
            {"_id": pet_listing_obj_id, "adoption_requests._id": request_id},
            {"$set": {"adoption_requests.$.status": data["status"]}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Failed to update adoption request"}), 400

        # Additional status handling
        if data["status"] == "Approved":
            # Update pet status
            mongo.db.pet_listings.update_one(
                {"_id": pet_listing_obj_id},
                {"$set": {"status": "Adopted"}}
            )
            
            # Reject all other pending requests
            mongo.db.pet_listings.update_one(
                {"_id": pet_listing_obj_id},
                {"$set": {"adoption_requests.$[elem].status": "Rejected"}},
                array_filters=[{"elem.status": "Pending", "elem._id": {"$ne": request_id}}]
            )
            
        elif data["status"] == "Rejected":
            # Check if there are no more pending requests
            updated_pet = mongo.db.pet_listings.find_one({"_id": pet_listing_obj_id})
            has_pending = any(req["status"] == "Pending" for req in updated_pet.get("adoption_requests", []))
            
            if not has_pending:
                mongo.db.pet_listings.update_one(
                    {"_id": pet_listing_obj_id},
                    {"$set": {"status": "Available"}}
                )

        return jsonify({"message": f"Request {data['status'].lower()} successfully"}), 200

    except Exception as e:
        print(f"Error in update_adoption_request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/pet-listing/<string:pet_id>', methods=['PATCH'])
@jwt_required()
def update_pet_status(pet_id):
    data = request.json
    if "status" not in data:
        return jsonify({"error": "Missing status field"}), 400

    user = get_jwt_identity()
    pet = mongo.db.pet_listings.find_one({"_id": ObjectId(pet_id)})
    
    if not pet or pet["owner"] != user["email"]:
        return jsonify({"error": "Unauthorized"}), 403

    result = mongo.db.pet_listings.update_one(
        {"_id": ObjectId(pet_id)},
        {"$set": {"status": data["status"]}}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Failed to update pet status"}), 400

    return jsonify({"message": "Pet status updated successfully"}), 200

# --- Admin Endpoints ---

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
@role_required("admin")
def get_all_users():
    users = list(mongo.db.users.find())
    for u in users:
        u["_id"] = str(u["_id"])
        u.pop("password", None)
    return jsonify(users), 200

@app.route('/api/admin/pet-listings', methods=['GET'])
@jwt_required()
@role_required("admin")
def get_all_pet_listings():
    listings = list(mongo.db.pet_listings.find())
    for pet in listings:
        pet["_id"] = str(pet["_id"])
        if pet["image"].startswith('/uploads/'):
            pet["image"] = f"http://{request.host}{pet['image']}"
    return jsonify(listings), 200

@app.route('/api/pet-listing/<string:pet_id>', methods=['DELETE'])
@jwt_required()
def delete_pet_listing(pet_id):
    try:
        # Convert to ObjectId
        pet_listing_id = ObjectId(pet_id)
    except:
        return jsonify({"error": "Invalid pet listing ID format"}), 400

    user = get_jwt_identity()
    
    # Verify pet owner
    pet = mongo.db.pet_listings.find_one({"_id": pet_listing_id})
    if not pet:
        return jsonify({"error": "Pet listing not found"}), 404
    if pet["owner"] != user["email"]:
        return jsonify({"error": "Unauthorized to delete this listing"}), 403

    # Delete the pet listing
    result = mongo.db.pet_listings.delete_one({"_id": pet_listing_id})
    
    if result.deleted_count == 0:
        return jsonify({"error": "Failed to delete pet listing"}), 400

    return jsonify({"message": "Pet listing deleted successfully"}), 200

@app.route('/api/my-adoption-requests', methods=['GET'])
@jwt_required()
def get_user_adoption_requests():
    user = get_jwt_identity()
    
    # Find all pets that have adoption requests from this user
    pets_with_requests = list(mongo.db.pet_listings.aggregate([
        {
            '$match': {
                'adoption_requests.requester_id': user['email']
            }
        },
        {
            '$unwind': '$adoption_requests'
        },
        {
            '$match': {
                'adoption_requests.requester_id': user['email']
            }
        },
        {
            '$project': {
                '_id': 0,
                'request_id': '$adoption_requests._id',
                'status': '$adoption_requests.status',
                'request_date': '$adoption_requests.request_date',
                'updated_at': '$adoption_requests.updated_at',
                'pet': {
                    '_id': '$_id',
                    'name': '$name',
                    'image': '$image',
                    'owner_contact': '$owner_contact'
                }
            }
        }
    ]))
    
    return jsonify(pets_with_requests), 200

@app.route('/api/adoption-request/<string:request_id>', methods=['DELETE'])
@jwt_required()
def delete_adoption_request(request_id):
    user = get_jwt_identity()
    
    # Find and remove the request
    result = mongo.db.pet_listings.update_one(
        {
            'adoption_requests._id': request_id,
            'adoption_requests.requester_id': user['email']
        },
        {
            '$pull': {
                'adoption_requests': {
                    '_id': request_id,
                    'requester_id': user['email']
                }
            }
        }
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Request not found or already removed"}), 404
    
    return jsonify({"message": "Adoption request removed successfully"}), 200

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, port=5000)