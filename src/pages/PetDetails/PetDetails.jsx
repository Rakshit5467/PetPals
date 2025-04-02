import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Container } from 'react-bootstrap';
import axios from 'axios';

const PetDetails = () => {
  const { id } = useParams();
  const [pet, setPet] = useState({});

  useEffect(() => {
    fetchPetDetails();
  }, []);

  const fetchPetDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/pets/${id}`);
      setPet(response.data);
    } catch (error) {
      console.error("Error fetching pet details:", error);
    }
  };

  return (
    <Container className="my-4">
      <Card>
        <Card.Img variant="top" src={pet.image} alt={pet.name} />
        <Card.Body>
          <Card.Title>{pet.name}</Card.Title>
          <Card.Text>
            Breed: {pet.breed}
            <br />
            Age: {pet.age} years
            <br />
            Description: {pet.description}
          </Card.Text>
          <Button variant="success">Request Adoption</Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PetDetails;
