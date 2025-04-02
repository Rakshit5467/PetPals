import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar expand="lg" style={{ backgroundColor: '#4E944F' }} variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ fontSize: '1.5rem', color: '#FFD369' }}>
          🐾 PetPal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-center">
          <Nav className="me-auto">
          <Nav.Link as={Link} to="/" active={isActive("/")}>Home</Nav.Link>
<Nav.Link as={Link} to="/adoptions" active={isActive("/adoptions")}>Adoption Requests</Nav.Link>
<Nav.Link as={Link} to="/care" active={isActive("/care")}>Pet Care</Nav.Link>
<Nav.Link as={Link} to="/dashboard" active={isActive("/dashboard")}>Dashboard</Nav.Link>

          </Nav>
          <Nav>
            <Button as={Link} to="/login" variant="outline-light" className="mx-2">Login</Button>
            <Button as={Link} to="/signup" style={{ backgroundColor: '#FFD369', border: 'none' }}>Sign Up</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
