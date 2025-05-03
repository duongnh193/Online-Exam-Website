import React, { useState } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import authService from '../../services/authService';
import './AuthModal.css';

const ResetPasswordModal = ({ show, handleClose, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Enter email, 2: Enter OTP and new password, 3: Success
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Reset the form when modal is closed
  const handleModalClose = () => {
    setCurrentStep(1);
    setEmailOrUsername('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setTimeLeft(0);
    handleClose();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    if (!emailOrUsername) {
      setError('Please enter your email or username');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Requesting OTP for reset password:', emailOrUsername);
      const response = await authService.resendOtp(emailOrUsername);
      
      console.log('Request OTP response:', response);
      setCurrentStep(2);
      setTimeLeft(60);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Request OTP error:', err);
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOtp = async () => {
    if (timeLeft > 0 || isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Resending OTP for reset password:', emailOrUsername);
      await authService.resendOtp(emailOrUsername);
      
      setTimeLeft(60);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Resetting password for:', emailOrUsername);
      const resetData = {
        emailOrUsername: emailOrUsername,
        otp: otp,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      };
      
      const response = await authService.resetPassword(resetData);
      console.log('Reset password response:', response);
      
      setCurrentStep(3);
      
      // Auto-close after success and switch to login
      setTimeout(() => {
        handleModalClose();
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 3000);
      
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please verify your code and try again.');
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

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const renderStep1 = () => (
    <>
      <div className="text-center mb-4">
        <h2 className="reset-password-title mb-1">Forgot Password</h2>
        <p className="reset-password-subtitle">Enter your email or username to receive a verification code.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleRequestOtp}>
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
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Button>
        </div>
      </Form>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="text-center mb-4">
        <h2 className="reset-password-title mb-1">Reset Password</h2>
        <p className="reset-password-subtitle">Enter the verification code sent to your email and your new password.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleResetPassword}>
        <Form.Group className="mb-3">
          <Form.Label>Verification Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="auth-input"
          />
        </Form.Group>

        <div className="text-center mb-3">
          <p className={`otp-resend ${timeLeft === 0 && !isLoading ? 'active' : ''}`} onClick={handleResendOtp}>
            Didn't receive code?
          </p>
          {timeLeft > 0 && (
            <p className="otp-timer">
              You can request code in {timeLeft} s
            </p>
          )}
        </div>

        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button 
              type="button" 
              className="password-toggle" 
              onClick={togglePasswordVisibility}
              tabIndex="-1"
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.33334 8.00002C2.33334 8.00002 4.33334 3.33335 8.00001 3.33335C11.6667 3.33335 13.6667 8.00002 13.6667 8.00002C13.6667 8.00002 11.6667 12.6667 8.00001 12.6667C4.33334 12.6667 2.33334 8.00002 2.33334 8.00002Z" stroke="#71717A" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="#71717A" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 3L13 13" stroke="#71717A" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.99978 2C11.5944 2 14.5851 4.58667 15.2124 8C14.5858 11.4133 11.5944 14 7.99978 14C4.40511 14 1.41444 11.4133 0.787109 8C1.41378 4.58667 4.40511 2 7.99978 2ZM7.99978 12.6667C9.35942 12.6664 10.6787 12.2045 11.7417 11.3568C12.8047 10.509 13.5484 9.32552 13.8511 8C13.5473 6.67554 12.8031 5.49334 11.7402 4.64668C10.6773 3.80003 9.35864 3.33902 7.99978 3.33902C6.64091 3.33902 5.32224 3.80003 4.25936 4.64668C3.19648 5.49334 2.45229 6.67554 2.14844 8C2.45117 9.32552 3.19489 10.509 4.25787 11.3568C5.32085 12.2045 6.64013 12.6664 7.99978 12.6667ZM7.99978 11C7.20413 11 6.44106 10.6839 5.87846 10.1213C5.31585 9.55871 4.99978 8.79565 4.99978 8C4.99978 7.20435 5.31585 6.44129 5.87846 5.87868C6.44106 5.31607 7.20413 5 7.99978 5C8.79543 5 9.55849 5.31607 10.1211 5.87868C10.6837 6.44129 10.9998 7.20435 10.9998 8C10.9998 8.79565 10.6837 9.55871 10.1211 10.1213C9.55849 10.6839 8.79543 11 7.99978 11ZM7.99978 9.66667C8.4418 9.66667 8.86573 9.49107 9.17829 9.17851C9.49085 8.86595 9.66644 8.44203 9.66644 8C9.66644 7.55797 9.49085 7.13405 9.17829 6.82149C8.86573 6.50893 8.4418 6.33333 7.99978 6.33333C7.55775 6.33333 7.13383 6.50893 6.82126 6.82149C6.5087 7.13405 6.33311 7.55797 6.33311 8C6.33311 8.44203 6.5087 8.86595 6.82126 9.17851C7.13383 9.49107 7.55775 9.66667 7.99978 9.66667Z" fill="#71717A"/>
                </svg>
              )}
            </button>
          </div>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="auth-input"
          />
        </Form.Group>

        <div className="d-grid mb-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      </Form>

      <div className="text-center mb-3">
        <span className="back-link" onClick={handleBackToStep1}>
          Back
        </span>
      </div>
    </>
  );

  const renderStep3 = () => (
    <div className="text-center py-3">
      <div className="mb-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h2 className="mb-3">Password Reset Successful</h2>
      <p className="text-muted">Your password has been reset successfully. You will be redirected to the login page.</p>
    </div>
  );

  return (
    <Modal show={show} onHide={handleModalClose} centered className="auth-modal">
      <Modal.Body className="p-4">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {currentStep < 3 && (
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