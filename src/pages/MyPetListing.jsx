import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Card, Button, Alert, Badge, Accordion, Modal } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';

const MyPetListings = () => {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/my-pet-listings',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setListings(response.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load your pet listings');
      }
    };

    if (user) {
      fetchListings();
    }
  }, [token, user]);

  const handleDeleteClick = (petId) => {
    setPetToDelete(petId);
    setShowDeleteModal(true);
  };

  const handleDeletePet = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/pet-listing/${petToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('Pet listing removed successfully!');
      setListings(listings.filter(pet => pet._id !== petToDelete));
    } catch (err) {
      console.error('Error deleting pet:', err);
      setError('Failed to remove pet listing');
    } finally {
      setShowDeleteModal(false);
      setPetToDelete(null);
    }
  };

  const handleApproveRequest = async (petId, requestId) => {
    try {
      // Approve the selected request
      await axios.put(
        `http://localhost:5000/api/adoption-request/${petId}/${requestId}`,
        { status: 'Approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mark pet as adopted
      await axios.patch(
        `http://localhost:5000/api/pet-listing/${petId}`,
        { status: 'Adopted' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reject all other pending requests
      const pet = listings.find(p => p._id === petId);
      const otherRequests = pet.adoption_requests.filter(
        req => req._id !== requestId && req.status === 'Pending'
      );

      await Promise.all(
        otherRequests.map(req =>
          axios.put(
            `http://localhost:5000/api/adoption-request/${petId}/${req._id}`,
            { status: 'Rejected' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          )
        )
      );

      setMessage('Adoption request approved successfully!');
      // Refresh listings
      const updatedResponse = await axios.get(
        'http://localhost:5000/api/my-pet-listings',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setListings(updatedResponse.data);
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve adoption request');
    }
  };

  const handleRejectRequest = async (petId, requestId) => {
    try {
      // Reject the specific request
      await axios.put(
        `http://localhost:5000/api/adoption-request/${petId}/${requestId}`,
        { status: 'Rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check if this was the last pending request
      const pet = listings.find(p => p._id === petId);
      const hasPendingRequests = pet.adoption_requests.some(
        req => req.status === 'Pending' && req._id !== requestId
      );

      // If no more pending requests, set status back to Available
      if (!hasPendingRequests) {
        await axios.patch(
          `http://localhost:5000/api/pet-listing/${petId}`,
          { status: 'Available' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage('Adoption request rejected successfully!');
      // Refresh listings
      const updatedResponse = await axios.get(
        'http://localhost:5000/api/my-pet-listings',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setListings(updatedResponse.data);
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject adoption request');
    }
  };

  return (
    <Container className="my-4">
      <h2>My Pet Listings</h2>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
      
      {listings.length === 0 ? (
        <Alert variant="info">You haven't listed any pets for adoption yet.</Alert>
      ) : (
        listings.map(listing => (
          <Card key={listing._id} className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <Card.Title>
                  {listing.name} 
                  <Badge bg={listing.status === 'Available' ? 'primary' : 
                            listing.status === 'Pending' ? 'warning' : 'success'} 
                          className="ms-2">
                    {listing.status}
                  </Badge>
                </Card.Title>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDeleteClick(listing._id)}
                >
                  Remove Listing
                </Button>
              </div>
              <Card.Text>
                <strong>Species:</strong> {listing.species}<br />
                <strong>Age:</strong> {listing.age}<br />
                <strong>Description:</strong> {listing.description}
              </Card.Text>
              
              <h5>Adoption Requests:</h5>
              {listing.adoption_requests?.length > 0 ? (
                <Accordion>
                  {listing.adoption_requests.map(request => (
                    <Accordion.Item key={request._id} eventKey={request._id}>
                      <Accordion.Header>
                        <div className="d-flex align-items-center">
                          <span className="me-3">{request.requester_name}</span>
                          <Badge bg={
                            request.status === 'Pending' ? 'warning' :
                            request.status === 'Approved' ? 'success' : 'danger'
                          }>
                            {request.status}
                          </Badge>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        {/* ... existing request details ... */}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <Alert variant="info">No adoption requests yet.</Alert>
              )}
            </Card.Body>
          </Card>
        ))
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove this pet listing? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePet}>
            Remove Listing
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyPetListings;