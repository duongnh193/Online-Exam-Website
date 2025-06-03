import axios from 'axios';
import mockUserService from './mockUserService';

// Use consistent API URL format with leading slash for proxy
const API_URL = 'http://localhost:8080/api/v1/auth';

// Helper to get dashboard route based on user role
const getDashboardByRole = (role) => {
  if (!role) return '/dashboard'; // Default dashboard
  
  const roleStr = role.toString().toUpperCase();
  if (roleStr.includes('ADMIN')) {
    return '/admin-dashboard';
  } else if (roleStr.includes('LECTURER')) {
    return '/lecturer-dashboard';
  } else if (roleStr.includes('STUDENT')) {
    return '/student-dashboard';
  }
  
  return '/dashboard'; // Fallback to default dashboard
};

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

// Log API requests for debugging
const logRequest = (method, url, data = null) => {
  console.log(`🔄 ${method} request to: ${url}`);
  if (data) {
    console.log('📦 Data:', JSON.stringify(data, null, 2));
  }
};

const authService = {
  // Register a new user
  register: async (userData) => {
    console.log('Registering user:', userData);
    logRequest('POST', `${API_URL}/signup`, userData);
    
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
        
        // Create initial user object with role
        const user = {
          id: response.data.userId,
          username: decodedToken?.sub, // subject is usually the username
          // Use the role from the JWT token - it should be in the "role" claim
          role: decodedToken?.role || null
        };
        
        console.log('Created initial user object with role:', user);
        
        try {
          // Fetch complete user data to ensure we have twoFactor status
          console.log('Fetching complete user data...');
          const userResponse = await axios.get(`http://localhost:8080/api/v1/users/${user.id}`, {
            headers: {
              'Authorization': `${response.data.tokenType || 'Bearer'} ${token}`
            },
            timeout: 10000 // 10 second timeout
          });
          
          console.log('User data response:', userResponse);
          
          // Normalize the 2FA status to ensure consistent boolean values
          const twoFactorStatus = userResponse.data.twoFactor === true || 
                                 userResponse.data.twoFactor === "true" || 
                                 userResponse.data.twoFactor === 1;
          
          // Combine the fetched user data with our initial user object
          const completeUser = {
            ...user,
            ...userResponse.data,
            // Ensure these are always boolean values
            twoFactorEnabled: twoFactorStatus,
            twoFactor: twoFactorStatus
          };
          
          console.log('Complete user data with 2FA status:', completeUser);
          localStorage.setItem('user', JSON.stringify(completeUser));
          
          user.twoFactorEnabled = completeUser.twoFactorEnabled;
          user.twoFactor = completeUser.twoFactor;
        } catch (userFetchError) {
          console.error('Error fetching complete user data:', userFetchError);
          // Still save the initial user data if we couldn't fetch the complete data
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        console.log('Stored user in localStorage:', JSON.parse(localStorage.getItem('user')));
        
        // Get the dashboard URL based on user role
        const redirectUrl = getDashboardByRole(user.role);
        
        return {
          token: token,
          tokenType: response.data.tokenType || 'Bearer',
          ...response.data,
          user: user,
          success: true,
          redirectUrl: redirectUrl
        };
      } catch (apiError) {
        console.warn('API login failed, falling back to mock login:', apiError);
        
        // Check for OTP in error response
        if (apiError.response && containsOtpMessage(apiError.response.data)) {
          console.log('OTP detected in error response');
          const email = extractEmailFromOtpMessage(apiError.response.data);
          
          return {
            requiresOtp: true,
            username: credentials.username,
            password: credentials.password,
            email: email,
            message: apiError.response.data
          };
        }
        
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
                mockResponse.user.username.toLowerCase().includes('lecturer') ? 'ROLE_LECTURER' : 'ROLE_STUDENT',
          twoFactor: mockResponse.user.twoFactor || false,
          twoFactorEnabled: mockResponse.user.twoFactor || false
        };
        
        console.log('Created mock user with role:', user);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Get the dashboard URL based on user role
        const redirectUrl = getDashboardByRole(user.role);
        
        return {
          token: token,
          tokenType: mockResponse.tokenType || 'Bearer',
          ...mockResponse,
          user: user,
          success: true,
          redirectUrl: redirectUrl
        };
      }
    } catch (error) {
      console.error('Login error (both API and mock):', error);
      
      // Check for OTP in error response
      if (error.response && containsOtpMessage(error.response.data)) {
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
  verifyOtp: async (verifyData) => {
    // Handle either 'username' or 'usernameOrEmail' to ensure backward compatibility
    const usernameOrEmail = verifyData.usernameOrEmail || verifyData.username;
    
    if (!usernameOrEmail) {
      console.error('Error: username or email is required for OTP verification');
      throw new Error('Username or email is required');
    }
    
    if (!verifyData.otp) {
      console.error('Error: OTP code is required for verification');
      throw new Error('OTP code is required');
    }
    
    logRequest('POST', `${API_URL}/verify-otp`, { usernameOrEmail, otp: verifyData.otp });
    console.log('Verifying OTP for:', usernameOrEmail);
    
    try {
      // Match the backend endpoint which expects 'otp' as a request param and loginRequest as body
      const loginRequest = {
        usernameOrEmail: usernameOrEmail,
        password: verifyData.password || '' // Password might be required by the backend
      };
      
      const response = await axios.post(
        `${API_URL}/verify-otp?otp=${encodeURIComponent(verifyData.otp)}`,
        loginRequest
      );
      
      console.log('Verify OTP response:', response);
      
      // If response is successful, process it like a login
      if (response.data && response.data.accessToken) {
        const token = response.data.accessToken;
        localStorage.setItem('token', token);
        localStorage.setItem('token_type', response.data.tokenType || 'Bearer');
        
        // Parse the JWT token to get user info including role
        const decodedToken = parseJwt(token);
        console.log('Decoded token after OTP:', decodedToken);
        
        // Create initial user object with role
        const user = {
          id: response.data.userId,
          username: decodedToken?.sub, // subject is usually the username
          role: decodedToken?.role || null
        };
        
        // Try to get full user data
        try {
          const userResponse = await axios.get(`http://localhost:8080/api/v1/users/${user.id}`, {
            headers: {
              'Authorization': `${response.data.tokenType || 'Bearer'} ${token}`
            },
            timeout: 10000 // 10 second timeout
          });
          
          // Normalize the 2FA status to ensure consistent boolean values
          const twoFactorStatus = userResponse.data.twoFactor === true || 
                                 userResponse.data.twoFactor === "true" || 
                                 userResponse.data.twoFactor === 1;
          
          const completeUser = {
            ...user,
            ...userResponse.data,
            twoFactorEnabled: twoFactorStatus,
            twoFactor: twoFactorStatus
          };
          
          localStorage.setItem('user', JSON.stringify(completeUser));
          user.twoFactorEnabled = completeUser.twoFactorEnabled;
          user.twoFactor = completeUser.twoFactor;
        } catch (userFetchError) {
          console.error('Error fetching user data after OTP:', userFetchError);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Get the dashboard URL based on user role
        const redirectUrl = getDashboardByRole(user.role);
        
        return {
          token: token,
          tokenType: response.data.tokenType || 'Bearer',
          ...response.data,
          user: user,
          success: true,
          redirectUrl: redirectUrl
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    console.log('authService: Clearing all authentication data');
    // Clear all authentication-related items
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
    // Clear any additional items that might be set
    sessionStorage.clear(); // Clear session storage too
    
    // Attempt to clear cookies related to authentication
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    
    console.log('authService: All auth data cleared');
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
  },
  
  // Enable 2FA for a user
  enable2FA: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Cannot enable 2FA: No authentication token found');
      throw new Error('Authentication required');
    }
    
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData || !userData.id) {
        console.error('Cannot enable 2FA: User ID not found');
        throw new Error('User information not available');
      }
      
      logRequest('PUT', `http://localhost:8080/api/v1/users/${userData.id}/2fa?twoFA=true`);
      console.log('Enabling 2FA for user ID:', userData.id);
      
      // Use the UserController endpoint directly, as it's more reliable
      const response = await axios.put(
        `http://localhost:8080/api/v1/users/${userData.id}/2fa?twoFA=true`, 
        {},
        {
          headers: {
            'Authorization': `${localStorage.getItem('token_type') || 'Bearer'} ${token}`
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('Enable 2FA response:', response);
      
      // Update user data in localStorage to reflect 2FA status
      if (userData) {
        userData.twoFactorEnabled = true;
        userData.twoFactor = true;
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Updated user data in localStorage with 2FA enabled:', userData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      
      // Handle specific error responses
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (error.response.status === 403) {
          throw new Error('You are not authorized to update 2FA settings.');
        } else if (error.response.status === 404) {
          throw new Error('User not found.');
        } else if (error.response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        }
      }
      
      throw error;
    }
  },
  
  // Disable 2FA for a user
  disable2FA: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Cannot disable 2FA: No authentication token found');
      throw new Error('Authentication required');
    }
    
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData || !userData.id) {
        console.error('Cannot disable 2FA: User ID not found');
        throw new Error('User information not available');
      }
      
      logRequest('PUT', `http://localhost:8080/api/v1/users/${userData.id}/2fa?twoFA=false`);
      console.log('Disabling 2FA for user ID:', userData.id);
      
      // Use the UserController endpoint directly, as it's more reliable
      const response = await axios.put(
        `http://localhost:8080/api/v1/users/${userData.id}/2fa?twoFA=false`, 
        {},
        {
          headers: {
            'Authorization': `${localStorage.getItem('token_type') || 'Bearer'} ${token}`
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('Disable 2FA response:', response);
      
      // Update user data in localStorage to reflect 2FA status
      if (userData) {
        userData.twoFactorEnabled = false;
        userData.twoFactor = false;
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Updated user data in localStorage with 2FA disabled:', userData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      
      // Handle specific error responses
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (error.response.status === 403) {
          throw new Error('You are not authorized to update 2FA settings.');
        } else if (error.response.status === 404) {
          throw new Error('User not found.');
        } else if (error.response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        }
      }
      
      throw error;
    }
  },
  
  // Check if 2FA is enabled for the current user
  is2FAEnabled: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.log('is2FAEnabled: No user data in localStorage');
        return false;
      }
      
      let userData;
      try {
        userData = JSON.parse(userStr);
      } catch (parseError) {
        console.error('is2FAEnabled: Failed to parse user data from localStorage', parseError);
        return false;
      }
      
      if (!userData) {
        console.log('is2FAEnabled: Invalid user data in localStorage');
        return false;
      }
      
      // Check all possible property names and formats for 2FA status
      const statusChecks = [
        // Check boolean values
        userData.twoFactorEnabled === true,
        userData.twoFactor === true,
        
        // Check string values "true"
        userData.twoFactorEnabled === "true",
        userData.twoFactor === "true",
        
        // Check numeric values 1
        userData.twoFactorEnabled === 1,
        userData.twoFactor === 1,
      ];
      
      // If any check is true, consider 2FA enabled
      const enabled = statusChecks.some(check => check === true);
      
      console.log('is2FAEnabled: 2FA status =', enabled, 'User data:', {
        id: userData.id,
        username: userData.username,
        twoFactorEnabled: userData.twoFactorEnabled,
        twoFactorEnabledType: typeof userData.twoFactorEnabled, 
        twoFactor: userData.twoFactor,
        twoFactorType: typeof userData.twoFactor
      });
      
      return enabled;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  },
  
  // Add or update the resendOtp method to match the backend API
  resendOtp: async (usernameOrEmail) => {
    if (!usernameOrEmail) {
      console.error('Error: username or email is required for resending OTP');
      throw new Error('Username or email is required');
    }
    
    logRequest('POST', `${API_URL}/resend-otp`);
    console.log('Resending OTP for:', usernameOrEmail);
    
    try {
      // Match the backend endpoint which expects 'usernameOrEmail' as a request param
      const response = await axios.post(`${API_URL}/resend-otp?usernameOrEmail=${encodeURIComponent(usernameOrEmail)}`);
      console.log('Resend OTP response:', response);
      return response.data;
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  },
  
  // Update the resetPassword method to match the backend API
  resetPassword: async (emailOrUsername) => {
    // Handle both string parameter and object parameter for backward compatibility
    const userIdentifier = typeof emailOrUsername === 'string' ? 
      emailOrUsername : 
      emailOrUsername?.emailOrUsername;
      
    if (!userIdentifier) {
      console.error('Error: email or username is required for password reset');
      throw new Error('Email or username is required');
    }
    
    logRequest('POST', `${API_URL}/reset-password`);
    console.log('Requesting password reset for:', userIdentifier);
    
    try {
      // Match the backend endpoint which expects 'emailOrUsername' as a request param
      const response = await axios.post(`${API_URL}/reset-password?emailOrUsername=${encodeURIComponent(userIdentifier)}`);
      console.log('Password reset response:', response);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },
  
  // Update the user's password
  updatePassword: async (currentPassword, newPassword) => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      console.error('Cannot update password: No authentication token found');
      throw new Error('Authentication required');
    }
    
    if (!userData || !userData.id) {
      console.error('Cannot update password: User ID not found');
      throw new Error('User information not available');
    }
    
    if (!currentPassword || !newPassword) {
      console.error('Cannot update password: Missing current or new password');
      throw new Error('Current and new passwords are required');
    }
    
    try {
      // Use the full backend URL instead of relative path
      const backendUrl = 'http://localhost:8080/api/v1/users';
      const endpoint = `${backendUrl}/${userData.id}/password`;
      
      logRequest('PUT', endpoint);
      console.log('Updating password for user ID:', userData.id);
      
      const updatePasswordRequest = {
        currentPassword: currentPassword,
        newPassword: newPassword
      };
      
      const response = await axios.put(
        endpoint, 
        updatePasswordRequest,
        {
          headers: {
            'Authorization': `${localStorage.getItem('token_type') || 'Bearer'} ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('Password update response status:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Handle specific error responses with detailed messages
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Current password is incorrect');
        } else if (error.response.status === 403) {
          throw new Error('You are not authorized to update this password');
        } else if (error.response.status === 400) {
          // Check if there's a specific message in the response
          const errorMessage = error.response.data?.message || 'Invalid password format';
          throw new Error(errorMessage);
        } else if (error.response.status === 404) {
          throw new Error('User not found');
        } else if (error.response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        }
      }
      
      // Network errors or other issues
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      
      // Fallback to generic error or the original error message
      throw error;
    }
  }
};

export default authService; 