// src/components/NavigationBar.js
import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Badge, Image, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaPaw, FaUser, FaPlus, FaHome, FaSignOutAlt } from 'react-icons/fa';

const NavigationBar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    navigate('/');
  };

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaPaw className="text-primary me-2" />
          <span className="fw-bold text-primary">PetPal</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                <Nav.Link as={Link} to="/" className="d-flex align-items-center mx-2">
                  <FaHome className="me-1" /> Home
                </Nav.Link>
                
                {user.role === 'user' && (
                  <>
                    <Nav.Link as={Link} to="/add-pet-listing" className="d-flex align-items-center mx-2">
                      <FaPlus className="me-1" /> List a Pet
                    </Nav.Link>
                    <Nav.Link as={Link} to="/my-pet-listings" className="d-flex align-items-center mx-2">
                      My Listings
                    </Nav.Link>
                    <Nav.Link as={Link} to="/my-adoption-requests" className="d-flex align-items-center mx-2">
                      My Listings
                    </Nav.Link>
                  </>
                )}
                
                {user.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin" className="mx-2">
                    <Badge bg="danger" className="me-1">Admin</Badge> Dashboard
                  </Nav.Link>
                )}
                
                <Dropdown align="end" className="ms-3">
                  <Dropdown.Toggle variant="light" id="dropdown-user" className="d-flex align-items-center border-0">
                    {user.avatar ? (
                      <Image src={user.avatar} roundedCircle width="30" height="30" className="me-2" />
                    ) : (
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px'}}>
                        <FaUser size={14} />
                      </div>
                    )}
                    <span className="d-none d-lg-inline">{user.name || user.email.split('@')[0]}</span>
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      <FaUser className="me-2" /> My Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <FaSignOutAlt className="me-2" /> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="mx-2">
                  <Button variant="outline-primary" size="sm">Login</Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" className="mx-2">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;