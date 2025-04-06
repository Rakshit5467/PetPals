// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import NavigationBar from './components/NavigationBar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import AddPetListing from './pages/AddPetListing';
import MyPetListings from './pages/MyPetListing';
import AdminDashboard from './pages/AdminDashboard';
import AdoptPet from './pages/AdoptPet';
import MyAdoptionRequests from './pages/MyAdoptionRequests';
import './App.css'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/add-pet-listing" element={<AddPetListing />} />
          <Route path="/my-pet-listings" element={<MyPetListings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/adopt/:id" element={<AdoptPet />} />
          <Route path="/" element={<Home />} />
          <Route path="/my-adoption-requests" element={<MyAdoptionRequests/>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
