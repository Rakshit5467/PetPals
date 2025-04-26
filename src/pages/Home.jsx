import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Card, Button, Row, Col, Badge, Accordion, Stack, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaPaw, FaHeart, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHome, FaHandsHelping, FaQuestionCircle } from 'react-icons/fa';

const Home = () => {
  const [petListings, setPetListings] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/pet-listings');
        setPetListings(response.data);
      } catch (err) {
        console.error('Error fetching pets:', err);
      }
    };
    fetchPets();
  }, []);

  const handleAdopt = (id) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/adopt/${id}`);
  };

  const hasPendingRequest = (pet) => {
    return pet.adoption_requests?.some(
      req => req.requester === user?.email && req.status === 'Pending'
    );
  };

  const isOwnPet = (pet) => {
    return pet.owner === user?.email;
  };

  // Featured pets for carousel
  const featuredPets = petListings.slice(0, 3);

  return (
    <Container className="my-4">
      {/* Hero Section */}
      <div className="bg-light p-4 rounded-3 mb-4 text-center">
        <h1 className="display-5">
          <FaPaw className="text-primary me-2" />
          Welcome to PetPal
        </h1>
        <p className="lead">Find loving homes for pets in need</p>
        {!user && (
          <Button variant="primary" size="lg" className="mt-2" onClick={() => navigate('/signup')}>
            Join Our Community
          </Button>
        )}
      </div>

      {/* Featured Pets Carousel */}
      {featuredPets.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-3 d-flex align-items-center">
            <FaHeart className="text-danger me-2" />
            Featured Pets
          </h4>
          <Carousel indicators={false} className="bg-light rounded-3">
            {featuredPets.map(pet => (
              <Carousel.Item key={pet._id}>
                <div className="d-flex justify-content-center p-3">
                  <Card style={{ width: '80%' }}>
                    <Row className="g-0">
                      <Col md={6}>
                        <Card.Img 
                          src={pet.image}
                          className="h-100"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      </Col>
                      <Col md={6}>
                        <Card.Body>
                          <Card.Title>{pet.name}</Card.Title>
                          <Badge bg="info">{pet.species}</Badge>
                          <Card.Text className="mt-2">
                            {pet.description.length > 100 ? 
                              `${pet.description.substring(0, 100)}...` : pet.description}
                          </Card.Text>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleAdopt(pet._id)}
                          >
                            Learn More
                          </Button>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      )}

      {/* Info Cards */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="h-100 text-center border-0 shadow-sm">
            <Card.Body>
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaHome className="text-primary" size={24} />
              </div>
              <Card.Title>Why Adopt?</Card.Title>
              <Card.Text className="small">
                Adopting a pet saves lives and provides a loving home to animals in need.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 text-center border-0 shadow-sm">
            <Card.Body>
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaHandsHelping className="text-success" size={24} />
              </div>
              <Card.Title>Our Mission</Card.Title>
              <Card.Text className="small">
                Connecting pets with caring owners through a simple and transparent process.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 text-center border-0 shadow-sm">
            <Card.Body>
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <FaQuestionCircle className="text-warning" size={24} />
              </div>
              <Card.Title>Need Help?</Card.Title>
              <Card.Text className="small">
                Our team is here to assist with any questions about pet adoption.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* All Pets Section */}
      <h4 className="mb-3 d-flex align-items-center">
        <FaPaw className="text-primary me-2" />
        Pets Available for Adoption
      </h4>
      
      <Row className="g-4">
        {petListings.map(pet => (
          <Col key={pet._id} xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <div className="position-relative">
                <Card.Img 
                  variant="top" 
                  src={pet.image}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = '/placeholder-pet.jpg'
                  }}
                />
                <Badge 
                  bg={
                    isOwnPet(pet) ? 'info' :
                    pet.status === 'Pending' ? 'warning' :
                    pet.status === 'Adopted' ? 'success' : 'secondary'
                  }
                  className="position-absolute top-0 end-0 m-2"
                >
                  {isOwnPet(pet) ? 'Your Listing' : pet.status}
                </Badge>
              </div>
              
              <Card.Body className="d-flex flex-column">
                <Stack direction="horizontal" className="justify-content-between mb-2">
                  <Card.Title className="mb-0">{pet.name}</Card.Title>
                  <Badge bg="info">{pet.species}</Badge>
                </Stack>
                
                <div className="mb-2">
                  <small className="text-muted">Age:</small>
                  <div className="fw-bold">{pet.age} years</div>
                </div>
                
                <Card.Text className="text-truncate" style={{ maxHeight: '3.6em' }}>
                  {pet.description}
                </Card.Text>
                
                <Accordion flush className="mt-2">
                  <Accordion.Item eventKey={pet._id}>
                    <Accordion.Header className="py-2">
                      <small>Contact Owner</small>
                    </Accordion.Header>
                    <Accordion.Body className="p-3">
                      <Stack gap={2}>
                        <div>
                          <small className="text-muted d-flex align-items-center">
                            <FaUser className="me-2" /> Contact
                          </small>
                          <div>{pet.owner_contact?.name}</div>
                        </div>
                        <div>
                          <small className="text-muted d-flex align-items-center">
                            <FaPhone className="me-2" /> Phone
                          </small>
                          <div>{pet.owner_contact?.phone}</div>
                        </div>
                      </Stack>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
                
                <div className="mt-3">
                  {!isOwnPet(pet) && pet.status === 'Available' && (
                    <Button 
                      variant="primary" 
                      onClick={() => handleAdopt(pet._id)}
                      disabled={hasPendingRequest(pet)}
                      className="w-100"
                    >
                      <FaHeart className="me-1" />
                      {hasPendingRequest(pet) ? 'Request Pending' : 'Adopt Me'}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;