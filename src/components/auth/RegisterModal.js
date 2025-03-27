import React, { useState } from 'react';
import { Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './AuthModal.css';

const RegisterModal = ({ show, handleClose, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    role: 'ROLE_STUDENT'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await authService.register(formData);
      
      // Handle successful registration
      console.log('Registration successful', response);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSwitchToLogin) onSwitchToLogin();
      }, 2000);
    } catch (err) {
      // Handle registration error
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    handleClose();
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="auth-modal">
      <Modal.Body className="p-4">
        <div className="text-center mb-3">
          <h2 className="mb-1">Lets Register Account</h2>
          <p className="register-greeting">Hello user , you have a greatful journey</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Registration successful! Redirecting to dashboard...</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="last name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </Form.Group>

          <Form.Group className="mb-3 position-relative">
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="auth-input"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className="auth-input"
              required
            >
              <option value="ROLE_STUDENT">Student</option>
              <option value="ROLE_LECTURER">Lecturer</option>
            </Form.Select>
          </Form.Group>

          <div className="d-grid mb-4">
            <Button
              variant="primary"
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : success ? (
                'Registration Successful!'
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </Form>

        <div className="text-center">
          <p className="mb-0">
            Already have an account? <span className="auth-link" onClick={handleSwitchToLogin}>Login</span>
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterModal; 