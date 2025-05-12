import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import authService from '../../services/authService';
import './AuthModal.css';

const OTPModal = ({ show, handleClose, otpData, onSuccess, onSubmit, onSwitchToLogin }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (show && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, show]);

  useEffect(() => {
    if (show) {
      setOtp(['', '', '', '']);
      setError('');
      setTimeLeft(60);
      setResendSuccess(false);
      
      // Focus on first input when modal opens
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [show]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Only take the first digit
    setOtp(newOtp);
    
    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 4) {
      setError('Please enter all 4 digits of the OTP.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('OTPModal: Submitting OTP:', otpValue);
      
      // Use the onSubmit prop if available, otherwise use the direct service call
      if (onSubmit) {
        const result = await onSubmit(otpValue);
        
        if (result && result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
        
        setIsLoading(false);
        // Success is handled by the parent component
      } else {
        // Fallback to direct service call
        console.log('OTPModal: Using direct service call for OTP verification');
        const response = await authService.verifyOtp({
          usernameOrEmail: otpData?.username,
          otp: otpValue,
          password: otpData?.password
        });
        
        console.log('OTPModal: OTP verification response:', response);
        setIsLoading(false);
        
        if (onSuccess) {
          onSuccess(response);
        }
      }
    } catch (err) {
      console.error('OTPModal: OTP verification error:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0 || resendLoading) return;
    
    setResendLoading(true);
    setError('');
    setResendSuccess(false);
    
    try {
      console.log('OTPModal: Resending OTP for:', otpData?.username);
      const response = await authService.resendOtp(otpData?.username);
      
      console.log('OTPModal: Resend OTP response:', response);
      setTimeLeft(60);
      setResendSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('OTPModal: Resend OTP error:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
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
        <div className="text-center mb-3">
          <h2 className="mb-1">You've Got Email</h2>
          <p className="text-muted px-4">
            We have sent the OTP verification code to your email address. check your email and enter the code below.
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {resendSuccess && <Alert variant="success">OTP has been resent successfully!</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <div className="otp-container">
            {otp.map((digit, index) => (
              <Form.Control
                key={index}
                ref={el => inputRefs.current[index] = el}
                className="otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                autoComplete="off"
              />
            ))}
          </div>
          
          <div className="text-center mb-3">
            <p className={`otp-resend ${timeLeft === 0 && !resendLoading ? 'active' : ''}`} onClick={handleResendOtp}>
              {resendLoading ? 'Sending...' : "Didn't receive email?"}
            </p>
            {timeLeft > 0 && (
              <p className="otp-timer">
                You can request code in {timeLeft} s
              </p>
            )}
          </div>

          <div className="d-grid mb-3">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? 'Verifying...' : 'Confirm'}
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

export default OTPModal; 