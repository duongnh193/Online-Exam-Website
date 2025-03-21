import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const AppRoutes = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Add more routes as needed */}
        {/* <Route path="/about" element={<AboutPage />} /> */}
        {/* <Route path="/resources" element={<ResourcesPage />} /> */}
        {/* <Route path="/contact" element={<ContactPage />} /> */}
      </Routes>
      <Footer />
    </Router>
  );
};

export default AppRoutes; 