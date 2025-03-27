import axios from 'axios';
import mockUserService from './mockUserService';

const API_URL = 'http://localhost:8080/api/v1/auth';

// Helper to check if response contains OTP message
const containsOtpMessage = (response) => {
  if (!response) return false;
  
  // Check different parts of the response for OTP message
  const checkText = (text) => {
    if (!text) return false;
    return /otp\s+(has\s+been\s+)?sent\s+to/i.test(text.toString().toLowerCase());
  };
  
  if (typeof response === 'string') {
    return checkText(response);
  }
  
  if (response.data) {
    if (typeof response.data === 'string') {
      return checkText(response.data);
    }
    if (response.data.message) {
      return checkText(response.data.message);
    }
  }
  
  if (response.message) {
    return checkText(response.message);
  }
  
  return false;
};

// Extract email from OTP message
const extractEmailFromOtpMessage = (message) => {
  if (!message) return null;
  
  const messageStr = message.toString().toLowerCase();
  const emailRegex = /otp\s+(has\s+been\s+)?sent\s+to\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const match = messageStr.match(emailRegex);
  
  return match ? match[2] : null;
};

const authService = {
  // Register a new user
  register: async (userData) => {
    console.log('Registering user:', userData);
    
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      });
      
      console.log('Registration response:', response);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login a user
  login: async (credentials) => {
    console.log('Login attempt for:', credentials.username);
    
    try {
      const response = await axios.post(`${API_URL}/login`, {
        usernameOrEmail: credentials.username,
        password: credentials.password
      });
      
      console.log('Login response:', response);
      
      // Check if the response contains OTP message
      if (typeof response.data === 'string' && containsOtpMessage(response.data)) {
        console.log('OTP detected in response');
        const email = extractEmailFromOtpMessage(response.data);
        
        return {
          requiresOtp: true,
          username: credentials.username,
          password: credentials.password,
          email: email,
          message: response.data
        };
      }
      
      // If it's a regular successful login
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('token_type', response.data.tokenType || 'Bearer');
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Check for OTP in error response
      if (containsOtpMessage(error.response?.data)) {
        const email = extractEmailFromOtpMessage(error.response.data);
        return {
          requiresOtp: true,
          username: credentials.username,
          password: credentials.password,
          email: email,
          message: error.response.data
        };
      }
      
      throw error;
    }
  },
  
  // Verify OTP
  verifyOtp: async (data) => {
    console.log('Verifying OTP:', data);
    
    try {
      const response = await axios.post(`${API_URL}/verify-otp?otp=${data.otp}`, {
        usernameOrEmail: data.username,
        password: data.password
      });
      
      console.log('OTP verification response:', response);
      
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('token_type', response.data.tokenType || 'Bearer');
      
      return response.data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
  },
  
  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },
  
  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  // Get auth header
  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    
    if (token) {
      return { Authorization: `${tokenType} ${token}` };
    } else {
      return {};
    }
  },
  
  // Get the current user
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/me`, {
          headers: {
            'Authorization': `${localStorage.getItem('token_type') || 'Bearer'} ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    }
    
    return null;
  }
};

export default authService; 