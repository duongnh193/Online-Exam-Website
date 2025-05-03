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
          const userResponse = await axios.get(`/api/v1/users/${user.id}`, {
            headers: {
              'Authorization': `${response.data.tokenType || 'Bearer'} ${token}`
            }
          });
          
          console.log('User data response:', userResponse);
          
          // Combine the fetched user data with our initial user object
          const completeUser = {
            ...user,
            ...userResponse.data,
            // Ensure these are boolean values
            twoFactorEnabled: !!userResponse.data.twoFactor,
            twoFactor: !!userResponse.data.twoFactor
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
      
      // Create initial user object with role
      const user = {
        id: response.data.userId,
        username: decodedToken?.sub, // subject is usually the username
        role: decodedToken?.role || null
      };
      
      console.log('Created initial user object with role after OTP:', user);
      
      try {
        // Fetch complete user data to ensure we have twoFactor status
        console.log('Fetching complete user data after OTP...');
        const userResponse = await axios.get(`/api/v1/users/${user.id}`, {
          headers: {
            'Authorization': `${response.data.tokenType || 'Bearer'} ${token}`
          }
        });
        
        console.log('User data response after OTP:', userResponse);
        
        // Combine the fetched user data with our initial user object
        const completeUser = {
          ...user,
          ...userResponse.data,
          // Ensure these are boolean values
          twoFactorEnabled: !!userResponse.data.twoFactor, 
          twoFactor: !!userResponse.data.twoFactor
        };
        
        console.log('Complete user data with 2FA status after OTP:', completeUser);
        localStorage.setItem('user', JSON.stringify(completeUser));
        
        user.twoFactorEnabled = completeUser.twoFactorEnabled;
        user.twoFactor = completeUser.twoFactor;
      } catch (userFetchError) {
        console.error('Error fetching complete user data after OTP:', userFetchError);
        // Still save the initial user data if we couldn't fetch the complete data
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      console.log('Stored user with role in localStorage after OTP:', JSON.parse(localStorage.getItem('user')));
      
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
    } catch (error) {
      console.error('OTP verification error:', error);
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
      logRequest('POST', `${API_URL}/enable-2fa`);
      
      try {
        // Try to use the auth endpoint first
        const response = await axios.post(`${API_URL}/enable-2fa`, {}, {
          headers: {
            'Authorization': `${localStorage.getItem('token_type') || 'Bearer'} ${token}`
          }
        });
        
        console.log('Enable 2FA response:', response);
        
        // Update user data in localStorage to reflect 2FA status
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          userData.twoFactorEnabled = true;
          userData.twoFactor = true; // Set both properties for consistency
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        return response.data;
      } catch (error) {
        console.warn('Auth endpoint for 2FA not available, using UserController endpoint:', error.message);
        
        // If auth endpoint fails, try using the user controller endpoint
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          throw new Error('User information not available');
        }
        
        // Import and use userService to update 2FA
        const { userService } = await import('./userService');
        const response = await userService.update2FA(userData.id, true);
        console.log('Enable 2FA via UserController response:', response);
        
        // Update user data in localStorage
        if (userData) {
          userData.twoFactorEnabled = true;
          userData.twoFactor = true;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
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
      logRequest('POST', `${API_URL}/disable-2fa`);
      
      try {
        // Try to use the auth endpoint first
        const response = await axios.post(`${API_URL}/disable-2fa`, {}, {
          headers: {
            'Authorization': `${localStorage.getItem('token_type') || 'Bearer'} ${token}`
          }
        });
        
        console.log('Disable 2FA response:', response);
        
        // Update user data in localStorage to reflect 2FA status
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          userData.twoFactorEnabled = false;
          userData.twoFactor = false; // Set both properties for consistency
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        return response.data;
      } catch (error) {
        console.warn('Auth endpoint for 2FA not available, using UserController endpoint:', error.message);
        
        // If auth endpoint fails, try using the user controller endpoint
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData.id) {
          throw new Error('User information not available');
        }
        
        // Import and use userService to update 2FA
        const { userService } = await import('./userService');
        const response = await userService.update2FA(userData.id, false);
        console.log('Disable 2FA via UserController response:', response);
        
        // Update user data in localStorage
        if (userData) {
          userData.twoFactorEnabled = false;
          userData.twoFactor = false;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
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
      
      const userData = JSON.parse(userStr);
      if (!userData) {
        console.log('is2FAEnabled: Invalid user data in localStorage');
        return false;
      }
      
      // More robustly check both property names and handle different data types
      // Convert explicitly to boolean, check string values "true"/"false" as well
      const twoFactorEnabled = userData.twoFactorEnabled === true || userData.twoFactorEnabled === "true";
      const twoFactor = userData.twoFactor === true || userData.twoFactor === "true";
      const enabled = twoFactorEnabled || twoFactor;
      
      console.log('is2FAEnabled: 2FA status =', enabled, 'User data:', {
        id: userData.id,
        username: userData.username,
        twoFactorEnabled: userData.twoFactorEnabled,
        twoFactorEnabledType: typeof userData.twoFactorEnabled, 
        twoFactor: userData.twoFactor,
        twoFactorType: typeof userData.twoFactor,
        allUserDataKeys: Object.keys(userData)
      });
      
      return enabled;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  }
};

export default authService; 