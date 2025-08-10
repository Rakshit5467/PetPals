import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaHome, FaHandshake, FaQuestionCircle, FaPaw } from 'react-icons/fa';
import '../App.css';

const Home = () => {
  const pets = [
    { id: 1, name: 'Bella', img: 'https://cdn.britannica.com/58/226558-050-0520A0C2/red-Maine-Coon-cat-grooming.jpg' },
    { id: 2, name: 'Max', img: 'https://i.pinimg.com/736x/99/b3/15/99b3153f425b69c20a9eda503978b576.jpg' },
    { id: 3, name: 'Luna', img: 'https://at-traineddogs.com/wp-content/uploads/2024/11/AT-Trained-Dogs-Luna-3-scaled.jpg' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        {/* Floating paw prints */}
        <span className="paw-print paw1">🐾</span>
        <span className="paw-print paw2">🐾</span>
        <span className="paw-print paw3">🐾</span>
        <span className="paw-print paw4">🐾</span>
        <span className="paw-print paw5">🐾</span>

        <Container>
          <Row className="align-items-center">
            {/* Left - text */}
            <Col md={6} className="text-center text-md-start hero-text">
              <h1>Welcome to PetPal</h1>
              <p>Find loving homes for pets in need. Adopt, don’t shop — make a furry friend today!</p>
              <Button className="hero-btn">🐶 Join Our Community</Button>
            </Col>

            {/* Right - image */}
            <Col md={6} className="text-center">
              <img
                src="https://i2-prod.mirror.co.uk/article26921984.ece/ALTERNATES/s1200b/3_beautiful-brown-dog-put-his-head-on-the-palm-of-the-person-and-friendly-looking-with-love-on-a-backg.jpg"
                alt="Happy pet"
                className="hero-image img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Info Section */}
      <Container className="my-5">
        <Row className="text-center">
          <Col md={4}>
            <Card className="info-card">
              <FaHome className="info-card-icon" color="#4e73df" />
              <h5>Why Adopt?</h5>
              <p>Adopting a pet saves lives and provides a loving home to animals in need.</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="info-card">
              <FaHandshake className="info-card-icon" color="#1cc88a" />
              <h5>Our Mission</h5>
              <p>Connecting pets with caring owners through a simple and transparent process.</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="info-card">
              <FaQuestionCircle className="info-card-icon" color="#f6c23e" />
              <h5>Need Help?</h5>
              <p>Our team is here to assist with any questions about pet adoption.</p>
            </Card>
          </Col>
        </Row>

        {/* Pets Section */}
        <h3 className="mt-5 mb-4 section-heading">
          <FaPaw color="#4e73df" /> Pets Available for Adoption
        </h3>
        <Row>
          {pets.map(pet => (
            <Col md={4} key={pet.id} className="mb-4">
              <Card className="pet-card">
                <Card.Img variant="top" src={pet.img} />
                <Card.Body>
                  <Card.Title>{pet.name}</Card.Title>
                  <Button variant="primary">Adopt Me</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Footer */}
      <footer className="footer">
        &copy; {new Date().getFullYear()} PetPal. All rights reserved.
      </footer>
    </>
  );
};

export default Home;
