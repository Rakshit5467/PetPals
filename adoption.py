from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Sample adoption request data
adoption_requests = []

# Submit an adoption request
@app.route('/api/adopt', methods=['POST'])
def adopt_pet():
    data = request.json
    if not all(key in data for key in ["pet_id", "adopter_name", "contact"]):
        return jsonify({"error": "Missing information"}), 400

    new_request = {
        "id": len(adoption_requests) + 1,
        "pet_id": data["pet_id"],
        "adopter_name": data["adopter_name"],
        "contact": data["contact"],
        "status": "Pending"
    }
    adoption_requests.append(new_request)
    return jsonify({"message": "Adoption request submitted!", "request": new_request}), 201

# Get all adoption requests
@app.route('/api/adoption-requests', methods=['GET'])
def get_adoption_requests():
    return jsonify(adoption_requests)

# Approve or reject an adoption request
@app.route('/api/adopt/<int:request_id>', methods=['PUT'])
def update_adoption_status(request_id):
    data = request.json
    request_item = next((r for r in adoption_requests if r["id"] == request_id), None)
    if not request_item:
        return jsonify({"error": "Request not found"}), 404

    if "status" in data and data["status"] in ["Approved", "Rejected"]:
        request_item["status"] = data["status"]
        return jsonify({"message": "Request updated!", "request": request_item})
    
    return jsonify({"error": "Invalid status"}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)  # Running on a different port
