  // src/pages/AdminDashboard.js
  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { Container, Tab, Tabs, Table, Card } from 'react-bootstrap';

  const AdminDashboard = () => {
    const [users, setUsers]         = useState([]);
    const [petListings, setPetListings] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
      axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));

      axios.get('http://localhost:5000/api/admin/pet-listings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setPetListings(res.data))
      .catch(err => console.error(err));
    }, [token]);

    return (
      <Container className="my-4">
        <h2>Admin Dashboard</h2>
        <Tabs defaultActiveKey="users" id="admin-tabs" className="mb-3">
          <Tab eventKey="users" title="Users">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="petListings" title="Pet Listings">
            {petListings.map(listing => (
              <Card key={listing._id} className="mb-3">
                <Card.Body>
                  <Card.Title>{listing.name}</Card.Title>
                  <Card.Text>
                    Species: {listing.species}<br />
                    Age: {listing.age}<br />
                    Owner: {listing.owner}<br />
                    Status: {listing.status}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </Tab>
        </Tabs>
      </Container>
    );
  };

  export default AdminDashboard;
