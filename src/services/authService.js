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

// JWT Token decoding function
const parseJwt = (token) => {
  try {
    console.log('Trying to parse token:', token);
    
    // Check if token is valid
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      console.error('Invalid token format:', token);
      return null;
    }
    
    // For Base64Url encoding
    const tokenParts = token.split('.');
    console.log('Token parts:', tokenParts.length);
    
    const base64Url = tokenParts[1];
    console.log('Base64Url part:', base64Url);
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      console.log('Decoded payload:', payload);
      return payload;
    } catch (decodeError) {
      console.error('Error decoding token payload:', decodeError);
      return null;
    }
  } catch (e) {
    console.error('Error parsing JWT token:', e);
    return null;
  }
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
      // Try to login with the API first
      try {
        const response = await axios.post(`${API_URL}/login`, {
          usernameOrEmail: credentials.username,
          password: credentials.password
        });
        
        console.log('Login response:', response);
        console.log('Login response data:', response.data);
        
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
        const token = response.data.accessToken;
        localStorage.setItem('token', token);
        localStorage.setItem('token_type', response.data.tokenType || 'Bearer');
        
        // Parse the JWT token to get user info including role
        const decodedToken = parseJwt(token);
        console.log('Decoded token:', decodedToken);
        
        // Create and store user object with role
        const user = {
          id: response.data.userId,
          username: decodedToken?.sub, // subject is usually the username
          // Use the role from the JWT token - it should be in the "role" claim
          role: decodedToken?.role || null
        };
        
        console.log('Created user object with role:', user);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Stored user with role in localStorage:', JSON.parse(localStorage.getItem('user')));
        
        return {
          ...response.data,
          user: user,
          success: true
        };
      } catch (apiError) {
        console.warn('API login failed, falling back to mock login:', apiError);
        
        // If API login fails, fall back to mock login for development
        const mockResponse = await mockUserService.findUserByCredentials(credentials.username, credentials.password);
        console.log('Mock login response:', mockResponse);
        
        // Store the token and user data
        const token = mockResponse.accessToken;
        localStorage.setItem('token', token);
        localStorage.setItem('token_type', mockResponse.tokenType || 'Bearer');
        
        // Create user object from mock response
        const user = {
          id: mockResponse.user.id,
          username: mockResponse.user.username,
          // For testing, assign ROLE_LECTURER if username contains 'admin' or 'lecturer', otherwise ROLE_STUDENT
          role: mockResponse.user.username.toLowerCase().includes('admin') ? 'ROLE_ADMIN' : 
                mockResponse.user.username.toLowerCase().includes('lecturer') ? 'ROLE_LECTURER' : 'ROLE_STUDENT'
        };
        
        console.log('Created mock user with role:', user);
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          ...mockResponse,
          user: user,
          success: true
        };
      }
    } catch (error) {
      console.error('Login error (both API and mock):', error);
      
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
      console.log('OTP verification response data:', response.data);
      
      const token = response.data.accessToken;
      localStorage.setItem('token', token);
      localStorage.setItem('token_type', response.data.tokenType || 'Bearer');
      
      // Parse the JWT token to get user info including role
      const decodedToken = parseJwt(token);
      console.log('Decoded token after OTP:', decodedToken);
      
      // Create and store user object with role
      const user = {
        id: response.data.userId,
        username: decodedToken?.sub, // subject is usually the username
        role: decodedToken?.role || null
      };
      
      console.log('Created user object with role after OTP:', user);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Stored user with role in localStorage after OTP:', JSON.parse(localStorage.getItem('user')));
      
      return {
        ...response.data,
        user: user,
        success: true
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
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