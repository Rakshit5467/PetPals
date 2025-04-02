import React, { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Button, Spinner } from 'react-bootstrap';

const Home = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/pets')
      .then(response => response.json())
      .then(data => {
        setPets(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching pets:', error);
        setLoading(false);
      });
  }, []);

  return (
    <Container className="text-center my-4">
      <h1 className="fw-bold">🐾 Welcome to PetPal 🐾</h1>
      <p className="text-muted">Find your perfect companion today!</p>

      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row className="mt-4">
          {pets.map((pet) => (
            <Col key={pet.id} md={6} lg={4} className="mb-4">
              <Card className="shadow-sm">
                <Card.Img 
                  variant="top" 
                  src={`https://placekitten.com/300/200?random=${pet.id}`} 
                  alt={pet.name} 
                />
                <Card.Body>
                  <Card.Title>{pet.name} ({pet.species})</Card.Title>
                  <Card.Text>Age: {pet.age} years</Card.Text>
                  <Button variant="success">Adopt {pet.name}</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Home;
