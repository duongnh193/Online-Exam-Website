import React, { useState } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import authService from '../../services/authService';
import './AuthModal.css';

const ResetPasswordModal = ({ show, handleClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Call reset password API
      await authService.resetPassword(email);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    handleClose();
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="auth-modal">
      <Modal.Body className="p-4">
        <div className="text-center mb-4">
          <h2 className="reset-password-title mb-1">Reset Password</h2>
          <p className="reset-password-subtitle">Enter your email for a password reset link.</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            Reset link sent successfully! Please check your email.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email, phone & Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </Form.Group>

          <div className="text-center mb-4">
            <span className="reset-email-link">Forgot Email?</span>
          </div>

          <div className="d-grid mb-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </div>
        </Form>

        <div className="text-center">
          <span className="back-link" onClick={handleBackToLogin}>
            Back to Sign In
          </span>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ResetPasswordModal; 