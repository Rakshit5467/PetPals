import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Card, Button, Row, Col, Badge, Alert, Modal } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import { FaPaw, FaTimes, FaCheck, FaClock, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MyAdoptionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/my-adoption-requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRequests(response.data);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load your adoption requests');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRequests();
    }
  }, [user]);

  const handleWithdrawRequest = (requestId) => {
    setRequestToDelete(requestId);
    setShowDeleteModal(true);
  };

  const confirmWithdrawRequest = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/adoption-request/${requestToDelete}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      
      setMessage('Adoption request withdrawn successfully!');
      setRequests(requests.filter(req => req._id !== requestToDelete));
    } catch (err) {
      console.error('Error withdrawing request:', err);
      setError('Failed to withdraw adoption request');
    } finally {
      setShowDeleteModal(false);
      setRequestToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge bg="success" className="d-flex align-items-center">
            <FaCheck className="me-1" /> Approved
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge bg="danger" className="d-flex align-items-center">
            <FaTimes className="me-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge bg="warning" text="dark" className="d-flex align-items-center">
            <FaClock className="me-1" /> Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container className="my-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4 d-flex align-items-center">
        <FaPaw className="text-primary me-2" />
        My Adoption Requests
      </h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {message && <Alert variant="success" onClose={() => setMessage('')} dismissible>{message}</Alert>}

      {requests.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FaInfoCircle size={48} className="text-muted mb-3" />
            <Card.Title>No Adoption Requests Found</Card.Title>
            <Card.Text>
              You haven't submitted any adoption requests yet.
            </Card.Text>
            <Button variant="primary" onClick={() => navigate('/')}>
              Browse Available Pets
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {requests.map(request => (
            <Col key={request._id} xs={12}>
              <Card className="shadow-sm">
                <Card.Body>
                  <div className="d-flex flex-column flex-md-row justify-content-between">
                    <div className="mb-3 mb-md-0">
                      <div className="d-flex align-items-center mb-2">
                        <h5 className="mb-0 me-3">{request.pet.name}</h5>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-muted small">
                        Requested on: {formatDate(request.request_date)}
                      </div>
                      {request.status !== 'Pending' && (
                        <div className="text-muted small">
                          Status updated: {formatDate(request.updated_at || request.request_date)}
                        </div>
                      )}
                    </div>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-primary" 
                        className="me-2"
                        onClick={() => navigate(`/pet/${request.pet._id}`)}
                      >
                        View Pet
                      </Button>
                      {request.status === 'Pending' && (
                        <Button 
                          variant="outline-danger"
                          onClick={() => handleWithdrawRequest(request._id)}
                        >
                          <FaTrash className="me-1" /> Withdraw
                        </Button>
                      )}
                    </div>
                  </div>

                  {request.status === 'Approved' && (
                    <Alert variant="success" className="mt-3">
                      <div className="d-flex align-items-center">
                        <FaCheck className="me-2" />
                        <div>
                          <strong>Congratulations!</strong> Your adoption request has been approved.
                          Contact the pet owner at {request.pet.owner_contact.phone} to arrange the adoption.
                        </div>
                      </div>
                    </Alert>
                  )}

                  {request.status === 'Rejected' && (
                    <Alert variant="light" className="mt-3">
                      <div className="d-flex align-items-center">
                        <FaInfoCircle className="me-2" />
                        <div>
                          Your adoption request was not approved for {request.pet.name}.
                          You can browse other available pets to find your perfect match.
                        </div>
                      </div>
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Withdrawal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to withdraw this adoption request? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmWithdrawRequest}>
            <FaTrash className="me-1" /> Withdraw Request
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyAdoptionRequests;