from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

pets = [
    {"id": 1, "name": "Bella", "species": "Dog", "age": 3},
    {"id": 2, "name": "Milo", "species": "Cat", "age": 2},
]

@app.route('/api/pets', methods=['GET'])
def get_pets():
    return jsonify(pets)

@app.route('/api/pet/<int:pet_id>', methods=['GET'])
def get_pet(pet_id):
    pet = next((p for p in pets if p["id"] == pet_id), None)
    return jsonify(pet) if pet else (jsonify({"error": "Pet not found"}), 404)


@app.route('/api/adopt', methods=['POST'])
def adopt_pet():
    data = request.json
    print("Adoption Request Received:", data)  # Debugging
    return jsonify({"message": "Adoption request submitted successfully!"})

if __name__ == '__main__':
    app.run(debug=True)
