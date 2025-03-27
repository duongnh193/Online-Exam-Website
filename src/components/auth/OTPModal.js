import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import authService from '../../services/authService';
import './AuthModal.css';

const OTPModal = ({ show, handleClose, data, onSuccess, onSwitchToLogin }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
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
      console.log('Verifying OTP:', otpValue);
      const response = await authService.verifyOtp({
        otp: otpValue,
        username: data?.username,
        password: data?.password
      });
      
      console.log('OTP verification response:', response);
      setIsLoading(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    
    try {
      await authService.resendOtp({
        username: data?.username,
        email: data?.email
      });
      
      setTimeLeft(60);
      setError('');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
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
            <p className="otp-resend" onClick={handleResendOtp}>
              Didn't receive email?
            </p>
            <p className="otp-timer">
              You can request code in {timeLeft} s
            </p>
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