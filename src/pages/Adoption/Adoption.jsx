import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const Adoption = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/adoption-requests');
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching adoption requests:", err);
      setError("Failed to load adoption requests.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5001/api/adopt/${id}`, { status });
      setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
    } catch (err) {
      console.error("Error updating adoption status:", err);
    }
  };

  return (
    <Container className="my-4">
      <h2 className="text-center">Adoption Requests</h2>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Pet Name</th>
              <th>Adopter</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map(request => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.petName}</td>
                  <td>{request.adopterName}</td>
                  <td>
                    <Badge bg={
                      request.status === "Pending" ? "warning" :
                      request.status === "Adopted" ? "success" :
                      "danger"
                    }>
                      {request.status}
                    </Badge>
                  </td>
                  <td>
                    {request.status === "Pending" && (
                      <>
                        <Button variant="success" size="sm" className="me-2" onClick={() => updateStatus(request.id, "Adopted")}>Approve</Button>
                        <Button variant="danger" size="sm" onClick={() => updateStatus(request.id, "Rejected")}>Reject</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No adoption requests found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Adoption;
