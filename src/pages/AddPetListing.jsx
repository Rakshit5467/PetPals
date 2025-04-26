import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AddPetListing = () => {
  // Pet Information
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  // Owner Information
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // UI State
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validate required fields
    if (!name || !species || !age || !description || !imageFile || 
        !ownerName || !phone || !street || !city || !state || !postalCode) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be 10 digits');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('species', species);
      formData.append('age', age);
      formData.append('description', description);
      formData.append('image', imageFile);

      // Add owner contact information
      formData.append('ownerName', ownerName);
      formData.append('phone', phone);
      formData.append('email', email || ''); // Optional
      formData.append('street', street);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('postalCode', postalCode);

      const response = await axios.post(
        'http://localhost:5000/api/pet-listing',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage('Pet listing created successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Error creating pet listing:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create pet listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="my-4" style={{ maxWidth: '800px' }}>
      <h2 className="text-center mb-4">Add Pet for Adoption</h2>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <h4 className="mb-3">Pet Information</h4>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Pet Name *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter pet name" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Species *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Dog, Cat, etc." 
                value={species}
                onChange={(e) => setSpecies(e.target.value)} 
                required 
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Age (years) *</Form.Label>
              <Form.Control 
                type="number" 
                min="0" 
                max="30" 
                placeholder="Enter age" 
                value={age}
                onChange={(e) => setAge(e.target.value)} 
                required 
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Pet Photo *</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                required 
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Description *</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Tell us about the pet's personality, habits, etc." 
            value={description}
            onChange={(e) => setDescription(e.target.value)} 
            required 
          />
        </Form.Group>

        {previewImage && (
          <div className="mb-3 text-center">
            <img 
              src={previewImage} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px',
                borderRadius: '8px'
              }} 
            />
          </div>
        )}

        <h4 className="mb-3 mt-4">Owner Information</h4>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Your Name *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter your name" 
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)} 
                required 
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone *</Form.Label>
              <Form.Control 
                type="tel" 
                placeholder="10-digit phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)} 
                required 
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            type="email" 
            placeholder="Enter email (optional)" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
          />
        </Form.Group>

        <h5 className="mb-3">Address</h5>
        <Form.Group className="mb-3">
          <Form.Label>Street Address *</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Street address" 
            value={street}
            onChange={(e) => setStreet(e.target.value)} 
            required 
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>City *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="City" 
                value={city}
                onChange={(e) => setCity(e.target.value)} 
                required 
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>State *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="State" 
                value={state}
                onChange={(e) => setState(e.target.value)} 
                required 
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Postal Code *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Postal code" 
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)} 
                required 
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-grid mt-4">
          <Button 
            variant="primary" 
            type="submit"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creating Listing...
              </>
            ) : 'Submit Listing'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddPetListing;