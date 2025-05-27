import React, { useState } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import authService from '../../services/authService';
import './AuthModal.css';

const ResetPasswordModal = ({ show, handleClose, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Enter email, 2: Success
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Reset the form when modal is closed
  const handleModalClose = () => {
    setCurrentStep(1);
    setEmailOrUsername('');
    setError('');
    setSuccessMessage('');
    handleClose();
  };

  // Handle password reset request
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!emailOrUsername) {
      setError('Please enter your email or username');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Requesting password reset for:', emailOrUsername);
      const response = await authService.resetPassword(emailOrUsername);
      
      console.log('Password reset response:', response);
      setCurrentStep(2);
      
      // Extract email from success message if possible
      let email = '';
      if (typeof response === 'string' && response.includes('@')) {
        const parts = response.split(' ');
        const emailPart = parts.find(part => part.includes('@'));
        if (emailPart) {
          email = emailPart;
        }
      }
      
      setSuccessMessage(`A new password has been sent to your email${email ? ` (${email})` : ''}.`);
      
      // Auto-close after success and switch to login
      setTimeout(() => {
        handleModalClose();
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 5000);
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    handleModalClose();
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  const renderStep1 = () => (
    <>
      <div className="text-center mb-4">
        <h2 className="reset-password-title mb-1">Forgot Password</h2>
        <p className="reset-password-subtitle">Enter your email or username to receive a new password.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleResetPassword}>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Email or Username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            className="auth-input"
          />
        </Form.Group>

        <div className="d-grid mb-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? 'Processing...' : 'Reset Password'}
          </Button>
        </div>
      </Form>
    </>
  );

  const renderStep2 = () => (
    <div className="text-center py-3">
      <div className="mb-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h2 className="mb-3">Password Reset Initiated</h2>
      <p className="text-muted">{successMessage || 'A new password has been sent to your email. Please check your inbox.'}</p>
      <p className="text-muted">You will be redirected to the login page in a few seconds.</p>
    </div>
  );

  return (
    <Modal show={show} onHide={handleModalClose} centered className="auth-modal">
      <Modal.Body className="p-4">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        {currentStep === 1 && (
          <div className="text-center">
            <span className="back-link" onClick={handleBackToLogin}>
              Back to Sign In
            </span>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ResetPasswordModal; 