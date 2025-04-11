import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            // Get user data from localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            console.log('Initial auth check - user data from localStorage:', userData);
            
            if (userData && userData.role) {
              console.log('Found authenticated user with role:', userData.role);
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              console.warn('User data missing or incomplete in localStorage');
              console.log('userData object:', userData);
              
              // Try to extract role from token if userData exists but role is missing
              if (userData && !userData.role && token) {
                try {
                  // Attempt to decode token and extract role
                  const base64Url = token.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                  }).join(''));
                  
                  const decodedToken = JSON.parse(jsonPayload);
                  console.log('Decoded token during auth check:', decodedToken);
                  
                  if (decodedToken && decodedToken.role) {
                    console.log('Found role in token:', decodedToken.role);
                    
                    // Update user data with role
                    const updatedUserData = {
                      ...userData,
                      role: decodedToken.role
                    };
                    
                    console.log('Updated user data with role:', updatedUserData);
                    localStorage.setItem('user', JSON.stringify(updatedUserData));
                    
                    setUser(updatedUserData);
                    setIsAuthenticated(true);
                    return;
                  }
                } catch (decodeError) {
                  console.error('Error decoding token during auth check:', decodeError);
                }
              }
              
              // Clear invalid data
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch (error) {
            console.error('Failed to validate token or parse user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      console.log('useAuth: Starting login process for:', credentials.username);
      const response = await authService.login(credentials);
      console.log('useAuth: Login response received:', response);
      
      if (response.success && response.user) {
        console.log('useAuth: Login successful with user data:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Add direct navigation based on role
        if (response.user?.role === 'ROLE_LECTURER' || response.user?.role === 'ROLE_ADMIN') {
          console.log('useAuth: Navigating to dashboard from useAuth, role:', response.user.role);
          
          // Important: Use setTimeout to ensure state updates before navigation
          setTimeout(() => {
            console.log('useAuth: Executing navigation to dashboard');
            navigate('/dashboard');
          }, 100);
        } else if (response.user?.role === 'ROLE_STUDENT') {
          console.log('useAuth: Navigating to student-dashboard from useAuth, role:', response.user.role);
          
          // Important: Use setTimeout to ensure state updates before navigation
          setTimeout(() => {
            console.log('useAuth: Executing navigation to student dashboard');
            navigate('/student-dashboard');
          }, 100);
        } else {
          console.warn('useAuth: No role found for redirection, user:', response.user);
        }
      } else if (response.requiresOtp) {
        console.log('useAuth: OTP required for login');
      } else {
        console.warn('useAuth: Login response success but missing user or unusual format:', response);
      }
      
      return response;
    } catch (error) {
      console.error('useAuth: Login error:', error);
      throw error;
    }
  };

  // Verify OTP function
  const verifyOtp = async (verificationData) => {
    try {
      console.log('useAuth: Starting OTP verification for:', verificationData.username);
      const response = await authService.verifyOtp(verificationData);
      console.log('useAuth: OTP verification response received:', response);
      
      if (response.success && response.user) {
        console.log('useAuth: OTP verification successful with user data:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Add direct navigation based on role
        if (response.user?.role === 'ROLE_LECTURER' || response.user?.role === 'ROLE_ADMIN') {
          console.log('useAuth: Navigating to dashboard from useAuth after OTP, role:', response.user.role);
          
          // Important: Use setTimeout to ensure state updates before navigation
          setTimeout(() => {
            console.log('useAuth: Executing navigation to dashboard after OTP');
            navigate('/dashboard');
          }, 100);
        } else if (response.user?.role === 'ROLE_STUDENT') {
          console.log('useAuth: Navigating to student-dashboard from useAuth after OTP, role:', response.user.role);
          
          // Important: Use setTimeout to ensure state updates before navigation
          setTimeout(() => {
            console.log('useAuth: Executing navigation to student dashboard after OTP');
            navigate('/student-dashboard');
          }, 100);
        } else {
          console.warn('useAuth: No role found for redirection after OTP, user:', response.user);
        }
      } else {
        console.warn('useAuth: OTP verification response success but missing user or unusual format:', response);
      }
      
      return response;
    } catch (error) {
      console.error('useAuth: OTP verification error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success && response.user) {
        console.log('Registration successful with user data:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    verifyOtp,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 