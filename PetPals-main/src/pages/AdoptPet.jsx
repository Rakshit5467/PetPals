import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const AdoptPet = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  let name = null;

  if(user){
    name = user.name
  }
  
  // Form state
  const [formData, setFormData] = useState({
    contact: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    homeType: 'apartment',
    yardSize: '',
    otherPets: '',
    petExperience: '',
    hoursAlone: '',
    adoptionReason: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        pet_listing_id: id,
        requester_name: user.name, // From AuthContext
        requester_email: user.email, // From AuthContext
        ...formData
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/adoption-request',
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(data.message);
      setError('');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Adoption request failed');
      console.error('Adoption error:', err.response?.data);
    }
  };

  return (
    <Container className="my-4">
      <h2>Adoption Application</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      {console.log(user)}
      
      <Form onSubmit={handleSubmit}>
        <h4 className="mb-3">Contact Information</h4>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number*</Form.Label>
          <Form.Control
            name="contact"
            type="tel"
            value={formData.contact}
            onChange={handleChange}
            required
            placeholder="Your contact number"
          />
        </Form.Group>

        <h4 className="mb-3 mt-4">Home Information</h4>
        <Form.Group className="mb-3">
          <Form.Label>Street Address*</Form.Label>
          <Form.Control
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Your full address"
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>City*</Form.Label>
              <Form.Control
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>State*</Form.Label>
              <Form.Control
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Postal Code*</Form.Label>
              <Form.Control
                name="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Home Type*</Form.Label>
          <Form.Select 
            name="homeType"
            value={formData.homeType}
            onChange={handleChange}
            required
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="condo">Condo</option>
            <option value="other">Other</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Yard/Outdoor Space</Form.Label>
          <Form.Control
            name="yardSize"
            type="text"
            value={formData.yardSize}
            onChange={handleChange}
            placeholder="Describe your outdoor space (if any)"
          />
        </Form.Group>

        <h4 className="mb-3 mt-4">Pet Experience</h4>
        <Form.Group className="mb-3">
          <Form.Label>Current Pets</Form.Label>
          <Form.Control
            name="otherPets"
            type="text"
            value={formData.otherPets}
            onChange={handleChange}
            placeholder="List any current pets you have"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Previous Pet Experience*</Form.Label>
          <Form.Control
            as="textarea"
            name="petExperience"
            value={formData.petExperience}
            onChange={handleChange}
            required
            placeholder="Describe your experience with pets"
            rows={3}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Hours Pet Would Be Alone Daily*</Form.Label>
          <Form.Control
            name="hoursAlone"
            type="number"
            value={formData.hoursAlone}
            onChange={handleChange}
            required
            min="0"
            max="24"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Reason for Adoption*</Form.Label>
          <Form.Control
            as="textarea"
            name="adoptionReason"
            value={formData.adoptionReason}
            onChange={handleChange}
            required
            placeholder="Why do you want to adopt this pet?"
            rows={3}
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button variant="primary" type="submit" size="lg">
            Submit Adoption Application
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AdoptPet;