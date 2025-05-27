import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import OTPModal from './OTPModal';
import './AuthModal.css';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { AuthContext } from '../../hooks/useAuth';

const LoginModal = ({ show, handleClose, onSwitchToRegister, onSwitchToResetPassword }) => {
  const navigate = useNavigate();
  const { login, verifyOtp } = useContext(AuthContext);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setOtpData(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Helper function to redirect based on user role
  const redirectBasedOnRole = (user) => {
    console.log('LoginModal: redirectBasedOnRole called with user:', user);
    
    // Debug localStorage state
    const localStorageState = {
      token: localStorage.getItem('token'),
      tokenType: localStorage.getItem('token_type'),
      user: localStorage.getItem('user'),
      parsedUser: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    };
    console.log('LoginModal: Current localStorage state:', localStorageState);
    
    // Use the role from localStorage as the source of truth (it's what will be used for subsequent requests)
    const storedUser = localStorageState.parsedUser;
    const roleFromStorage = storedUser?.role;
    const roleFromParam = user?.role;
    
    console.log('Role comparison:', { 
      roleFromStorage, 
      roleFromParam,
      match: roleFromStorage === roleFromParam
    });
    
    // Determine which role to use - prefer localStorage
    const effectiveRole = roleFromStorage || roleFromParam;
    
    console.log('LoginModal: Using effective role for redirection:', effectiveRole);
    
    // If no valid role found in either source, redirect to home
    if (!effectiveRole) {
      console.error('LoginModal: No valid role found for redirection');
      window.location.href = '/';
      return;
    }
    
    // Normalize role for comparison - strict equality check against expected values
    const normalizedRole = effectiveRole.toUpperCase();
    
    // Redirect based on normalized role
    console.log('LoginModal: Redirecting based on normalized role:', normalizedRole);
    
    if (normalizedRole === 'ROLE_LECTURER' || normalizedRole === 'ROLE_ADMIN') {
      console.log('LoginModal: Detected LECTURER or ADMIN role, navigating to /dashboard');
      window.location.href = '/dashboard';
    } else if (normalizedRole === 'ROLE_STUDENT') {
      console.log('LoginModal: Detected STUDENT role, navigating to /student-dashboard');
      window.location.href = '/student-dashboard';
    } else {
      console.warn('LoginModal: Unrecognized role format:', normalizedRole);
      window.location.href = '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('LoginModal: Attempting login for:', usernameOrEmail);
      console.log('LoginModal: Current localStorage state:', {
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user')
      });
      
      // Call authService directly to get the full response with OTP info
      const response = await authService.login({ username: usernameOrEmail, password });
      
      console.log('LoginModal: Login response:', response);
      
      // Check if OTP is required
      if (response.requiresOtp) {
        console.log('LoginModal: OTP required, showing OTP modal');
        setOtpData({
          username: usernameOrEmail,
          password,
          email: response.email,
          message: response.message
        });
        setShowOtpModal(true);
        setIsLoading(false);
        return;
      }
      
      // If we got here, no OTP required - regular login success
      // Use the login function from context to update auth state
      if (response.success && response.user) {
        login(response.token, response.user);
      }
      
      // Clear the form
      setUsernameOrEmail('');
      setPassword('');
      setIsLoading(false);
      
      // Close the modal
      handleClose();
      
      // Redirect based on role if success
      if (response.success && response.user) {
        redirectBasedOnRole(response.user);
      }
    } catch (err) {
      console.error('LoginModal: Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (otpValue) => {
    try {
      // Call authService directly for OTP verification
      const verificationData = {
        usernameOrEmail: otpData.username,
        password: otpData.password,
        otp: otpValue
      };
      
      console.log('LoginModal: Verifying OTP with data:', {
        ...verificationData,
        password: '********' // Don't log the actual password
      });
      
      const response = await authService.verifyOtp(verificationData);
      console.log('LoginModal: OTP verification response:', response);
      
      // Update auth context if successful
      if (response.success && response.user) {
        login(response.token, response.user);
        
        // Close modals
        setOtpData(null);
        handleCloseOtpModal();
        handleClose();
        
        // Redirect based on role
        redirectBasedOnRole(response.user);
      }
      
      return { success: true };
    } catch (err) {
      console.error('OTP verification failed:', err);
      return { 
        error: err.response?.data?.message || err.message || 'OTP verification failed.',
        success: false
      };
    }
  };

  const handleOtpSuccess = (response) => {
    console.log('OTP verification successful, user:', response?.user);
    handleCloseOtpModal();
    handleClose();
    redirectBasedOnRole(response?.user);
  };

  const handleSwitchToRegister = () => {
    handleClose();
    if (onSwitchToRegister) {
      onSwitchToRegister();
    }
  };

  const handleForgotPassword = () => {
    // Instead of trying to show our own modal, use the parent's callback
    handleClose(); // Close the login modal
    if (onSwitchToResetPassword) {
      onSwitchToResetPassword(); // This will open the parent's reset password modal
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered className="auth-modal">
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="mb-1">Lets Sign you in</h2>
            <p className="text-muted mb-0">Welcome Back ,</p>
            <p className="text-muted">You have been missed</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Email or Username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                className="auth-input"
              />
            </Form.Group>

            <Form.Group className="mb-2 position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            </Form.Group>
            
            <div className="text-end mb-3">
              <span className="forgot-link" onClick={handleForgotPassword}>
                Forgot Password?
              </span>
            </div>

            <div className="d-grid mb-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="auth-button"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
            
            <div className="divider mb-4">
              <span>or</span>
            </div>
            
            <div className="social-login mb-4">
              <button type="button" className="social-btn google">
                <FcGoogle size={20} />
              </button>
              <button type="button" className="social-btn facebook">
                <FaFacebook size={20} color="#1877F2" />
              </button>
              <button type="button" className="social-btn apple">
                <FaApple size={20} />
              </button>
            </div>
          </Form>
          
          <div className="text-center">
            <p className="mb-0">
              Don't have an account? <span className="auth-link" onClick={handleSwitchToRegister}>Register Now</span>
            </p>
          </div>
        </Modal.Body>
      </Modal>

      {showOtpModal && otpData && (
        <OTPModal
          show={showOtpModal}
          handleClose={handleCloseOtpModal}
          otpData={otpData}
          onSuccess={handleOtpSuccess}
          onSubmit={handleOtpSubmit}
        />
      )}
    </>
  );
};

export default LoginModal; 