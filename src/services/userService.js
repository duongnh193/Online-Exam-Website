import axios from 'axios';

// Use relative path for API URL to work with the proxy
const API_URL = 'http://localhost:8080/api/v1/users';

// Configuration for mock data fallbacks
const config = {
  useMockData: false, // Use real API
  debugMode: true    // Enable detailed logging
};

// Log API requests for debugging
const logRequest = (method, url, headers, data = null) => {
  if (config.debugMode) {
    console.log(`🔄 ${method} request to: ${url}`);
    console.log('🔑 Headers:', headers);
    if (data) {
      console.log('📦 Data:', data);
    }
  }
};

// Helper function to merge auth headers with any additional headers
const mergeHeaders = (additionalHeaders = {}) => {
  // Get auth header
  const authHeader = {
    'Authorization': `${localStorage.getItem('token_type') || 'Bearer'} ${localStorage.getItem('token')}`
  };
  
  // Get content type header
  const contentTypeHeader = {
    'Content-Type': 'application/json'
  };
  
  // Log auth header info for debugging
  console.log('Auth header info:', {
    tokenType: localStorage.getItem('token_type') || 'Bearer',
    tokenPresent: !!localStorage.getItem('token'),
    tokenFirstChars: localStorage.getItem('token')?.substring(0, 10) + '...' || 'none'
  });
  
  // Merge all headers
  return {
    ...contentTypeHeader,
    ...authHeader,
    ...additionalHeaders
  };
};

// Helper to generate realistic mock data if needed
const getMockData = (type) => {
  if (config.debugMode) {
    console.log(`📦 Using mock data for ${type}`);
  }
  
  switch (type) {
    case 'admin':
      return {
        data: {
          content: [
            { id: 1, username: 'admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'ROLE_ADMIN' }
          ]
        }
      };
    case 'lecturer':
      return {
        data: {
          content: [
            { id: 2, username: 'lecturer1', email: 'lecturer1@example.com', firstName: 'John', lastName: 'Doe', role: 'ROLE_LECTURER' },
            { id: 3, username: 'lecturer2', email: 'lecturer2@example.com', firstName: 'Jane', lastName: 'Smith', role: 'ROLE_LECTURER' }
          ]
        }
      };
    case 'student':
      return {
        data: {
          content: [
            { id: 4, username: 'student1', email: 'student1@example.com', firstName: 'Alice', lastName: 'Johnson', role: 'ROLE_STUDENT' },
            { id: 5, username: 'student2', email: 'student2@example.com', firstName: 'Bob', lastName: 'Brown', role: 'ROLE_STUDENT' }
          ]
        }
      };
    default:
      return { data: { content: [] } };
  }
};

class UserService {
  constructor() {
    this.name = 'userService';
  }

  // Configuration methods
  disableMockData() {
    config.useMockData = false;
    console.log('🚫 Mock data fallbacks have been disabled. Using real API only.');
    return this; // For method chaining
  }
  
  enableMockData() {
    config.useMockData = true;
    console.log('✅ Mock data fallbacks have been enabled.');
    return this; // For method chaining
  }
  
  setUseMockData(value) {
    config.useMockData = value;
    console.log(`${value ? '✅ Mock data fallbacks have been enabled.' : '🚫 Mock data fallbacks have been disabled. Using real API only.'}`);
    return this; // For method chaining
  }
  
  setDebugMode(enabled) {
    config.debugMode = enabled;
    console.log(`${enabled ? '🔍 Debug mode enabled' : '🔕 Debug mode disabled'}`);
    return this; // For method chaining
  }
  
  // API connection test
  async testApiConnection() {
    // Temporarily disable mock data for this test
    const originalMockSetting = config.useMockData;
    config.useMockData = false;
    
    console.log('🧪 Testing API connection...');
    try {
      // Try to get a list of users with minimal data
      const response = await axios.get(`${API_URL}?page=0&size=1`, {
        headers: mergeHeaders(),
        timeout: 5000 // Short timeout for quick feedback
      });
      
      console.log('✅ API connection successful!', {
        status: response.status,
        statusText: response.statusText,
        dataReceived: !!response.data
      });
      
      // Log the actual data structure for debugging
      console.log('API Response Structure:', {
        hasData: !!response.data,
        isArray: Array.isArray(response.data),
        hasContent: response.data && response.data.content,
        contentIsArray: response.data && Array.isArray(response.data.content),
        keys: response.data ? Object.keys(response.data) : [],
        firstRecord: response.data && response.data.content && response.data.content.length > 0 
          ? response.data.content[0] 
          : (Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null)
      });
      
      // Restore original mock setting
      config.useMockData = originalMockSetting;
      return {
        success: true,
        status: response.status,
        message: 'API connection successful!',
        dataStructure: response.data ? Object.keys(response.data) : []
      };
    } catch (error) {
      console.error('❌ API connection failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      
      // Restore original mock setting
      config.useMockData = originalMockSetting;
      return {
        success: false,
        status: error.response?.status || 'NETWORK_ERROR',
        message: `API connection failed: ${error.message}`,
        error: error
      };
    }
  }

  // Get all users (admin only)
  getAllUsers(page = 0, size = 50) {
    const url = `${API_URL}?page=${page}&size=${size}`;
    const headers = mergeHeaders();
    logRequest('GET', url, headers);
    
    return axios.get(url, { headers })
      .catch(error => {
        console.error('Error fetching all users:', error.message);
        // Return empty array for user list or throw error if mock data is disabled
        if (!config.useMockData) {
          throw error;
        }
        return { data: { content: [] } };
      });
  }

  // Get current user's information from token
  getCurrentUser() {
    // Since there's no /me endpoint, we need to extract user ID from the token
    // and use getUserById instead
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user data found in localStorage');
        return Promise.reject('No user data found');
      }
      
      const user = JSON.parse(userStr);
      if (!user || !user.id) {
        console.error('Invalid user data in localStorage:', user);
        return Promise.reject('Invalid user data');
      }
      
      console.log('Getting current user data using ID:', user.id);
      return this.getUserById(user.id);
    } catch (error) {
      console.error('Error getting current user:', error.message);
      return Promise.reject(error);
    }
  }

  // Get all admin users
  getAllAdmins(page = 0, size = 50) {
    const url = `${API_URL}/admin?page=${page}&size=${size}`;
    const headers = mergeHeaders();
    logRequest('GET', url, headers);
    
    return axios.get(url, { headers })
      .then(response => {
        console.log('Admin response data format:', {
          hasContent: !!(response.data && response.data.content), 
          isArray: Array.isArray(response.data),
          keys: response.data ? Object.keys(response.data) : []
        });
        return response;
      })
      .catch(error => {
        console.error('Error fetching admin users:', error.message);
        console.error('Full error:', {
          status: error.response?.status,
          data: error.response?.data,
          url
        });
        
        if (!config.useMockData) {
          throw error;
        }
        console.log('Falling back to mock admin data');
        return getMockData('admin');
      });
  }

  // Get all lecturer users
  getAllLecturers(page = 0, size = 50) {
    const url = `${API_URL}/lecturer?page=${page}&size=${size}`;
    const headers = mergeHeaders();
    logRequest('GET', url, headers);
    
    return axios.get(url, { headers })
      .then(response => {
        console.log('Lecturer response data format:', {
          hasContent: !!(response.data && response.data.content), 
          isArray: Array.isArray(response.data),
          keys: response.data ? Object.keys(response.data) : []
        });
        return response;
      })
      .catch(error => {
        console.error('Error fetching lecturer users:', error.message);
        console.error('Full error:', {
          status: error.response?.status,
          data: error.response?.data,
          url
        });
        
        if (!config.useMockData) {
          throw error;
        }
        console.log('Falling back to mock lecturer data');
        return getMockData('lecturer');
      });
  }

  // Get all student users
  getAllStudents(page = 0, size = 50) {
    const url = `${API_URL}/student?page=${page}&size=${size}`;
    const headers = mergeHeaders();
    logRequest('GET', url, headers);
    
    return axios.get(url, { headers })
      .then(response => {
        console.log('Student response data format:', {
          hasContent: !!(response.data && response.data.content), 
          isArray: Array.isArray(response.data),
          keys: response.data ? Object.keys(response.data) : []
        });
        return response;
      })
      .catch(error => {
        console.error('Error fetching student users:', error.message);
        console.error('Full error:', {
          status: error.response?.status,
          data: error.response?.data,
          url
        });
        
        if (!config.useMockData) {
          throw error;
        }
        console.log('Falling back to mock student data');
        return getMockData('student');
      });
  }

  // Get user by ID
  getUserById(id) {
    if (!id) {
      console.error('getUserById called with invalid ID:', id);
      return Promise.reject(new Error('Invalid user ID'));
    }
    
    const url = `${API_URL}/${id}`;
    const headers = mergeHeaders();
    logRequest('GET', url, headers);
    console.log(`Getting user with ID: ${id}`);
    
    return axios.get(url, { headers })
      .then(response => {
        console.log(`Successfully retrieved user with ID ${id}:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`Error fetching user by ID ${id}:`, error.message);
        console.error('Full error object:', error);
        console.error('URL that failed:', url);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        
        if (!config.useMockData) {
          throw error;
        }
        // Return mock user based on ID
        return { 
          data: { 
            id, 
            username: `user${id}`, 
            email: `user${id}@example.com`,
            firstName: 'Mock',
            lastName: 'User',
            role: 'ROLE_STUDENT'
          } 
        };
      });
  }

  // Get user by username (admin only)
  getUserByUsername(username) {
    return axios.get(`${API_URL}/by-username?username=${username}`, { headers: mergeHeaders() })
      .catch(error => {
        console.error(`Error fetching user by username ${username}:`, error.message);
        if (!config.useMockData) {
          throw error;
        }
        return { 
          data: { 
            id: Math.floor(Math.random() * 1000), 
            username, 
            email: `${username}@example.com`,
            firstName: 'Mock',
            lastName: 'User',
            role: 'ROLE_STUDENT'
          } 
        };
      });
  }

  // Get user by email (admin only)
  getUserByEmail(email) {
    return axios.get(`${API_URL}/by-email?email=${email}`, { headers: mergeHeaders() })
      .catch(error => {
        console.error(`Error fetching user by email ${email}:`, error.message);
        if (!config.useMockData) {
          throw error;
        }
        const username = email.split('@')[0];
        return { 
          data: { 
            id: Math.floor(Math.random() * 1000), 
            username,
            email,
            firstName: 'Mock',
            lastName: 'User',
            role: 'ROLE_STUDENT'
          } 
        };
      });
  }

  // Create a new user (admin only)
  createUser(userData) {
    const url = `${API_URL}`;
    const headers = mergeHeaders();
    logRequest('POST', url, headers, userData);
    console.log('Creating user with data:', userData);
    
    return axios.post(url, userData, { headers })
      .then(response => {
        console.log('User created successfully:', response);
        return response;
      })
      .catch(error => {
        console.error('Error creating user:', error.message);
        console.error('Full error object:', error);
        console.error('URL that failed:', url);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        
        if (!config.useMockData) {
          throw error;
        }
        // Return mock success response
        return { 
          data: { 
            success: true, 
            message: 'User created successfully (mock)',
            user: {
              id: Math.floor(Math.random() * 1000),
              ...userData
            }
          } 
        };
      });
  }

  // Update a user
  updateUser(id, userData) {
    const url = `${API_URL}/${id}`;
    const headers = mergeHeaders();
    logRequest('PUT', url, headers, userData);
    console.log(`Updating user ${id} with data:`, userData);
    
    return axios.put(url, userData, { headers })
      .then(response => {
        console.log('User updated successfully:', response);
        return response;
      })
      .catch(error => {
        console.error(`Error updating user ${id}:`, error.message);
        console.error('Full error object:', error);
        console.error('URL that failed:', url);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        
        if (!config.useMockData) {
          throw error;
        }
        return { 
          data: { 
            success: true, 
            message: 'User updated successfully (mock)',
            user: {
              id,
              ...userData
            }
          } 
        };
      });
  }

  // Update password
  updatePassword(id, passwordData) {
    const url = `${API_URL}/${id}/password`;
    const headers = mergeHeaders();
    
    console.log('Updating password with data:', {
      userId: id,
      url: url,
      headers: {
        Authorization: headers.Authorization?.substring(0, 15) + '...',
        contentType: headers['Content-Type']
      },
      requestFields: Object.keys(passwordData),
      requestDataExample: {
        currentPassword: '***',
        newPassword: '***'
      }
    });
    
    return axios.put(url, passwordData, { headers })
      .then(response => {
        console.log('Password updated successfully:', response.status);
        return response;
      })
      .catch(error => {
        console.error(`Error updating password for user ${id}:`, error.message);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        
        if (!config.useMockData) {
          throw error;
        }
        return { 
          data: { 
            success: true, 
            message: 'Password updated successfully (mock)'
          } 
        };
      });
  }

  // Update 2FA settings
  update2FA(id, twoFA) {
    return axios.put(`${API_URL}/${id}/2fa?twoFA=${twoFA}`, {}, { headers: mergeHeaders() })
      .catch(error => {
        console.error(`Error updating 2FA for user ${id}:`, error.message);
        if (!config.useMockData) {
          throw error;
        }
        return { 
          data: { 
            success: true, 
            message: '2FA settings updated successfully (mock)'
          } 
        };
      });
  }

  // Update user role (admin only)
  updateRole(id, role) {
    return axios.put(`${API_URL}/${id}/role?role=${role}`, {}, { headers: mergeHeaders() })
      .catch(error => {
        console.error(`Error updating role for user ${id}:`, error.message);
        if (!config.useMockData) {
          throw error;
        }
        return { 
          data: { 
            success: true, 
            message: `Role updated to ${role} successfully (mock)`
          } 
        };
      });
  }

  // Delete a user (admin only)
  deleteUser(id) {
    return axios.delete(`${API_URL}/${id}`, { headers: mergeHeaders() })
      .catch(error => {
        console.error(`Error deleting user ${id}:`, error.message);
        if (!config.useMockData) {
          throw error;
        }
        return { 
          data: { 
            success: true, 
            message: 'User deleted successfully (mock)'
          } 
        };
      });
  }

  // Get login history of user by userId
  getLoginHistory(userId, page = 0, size = 10) {
    if (!userId) {
      console.error('getLoginHistory called with invalid userId:', userId);
      return Promise.reject(new Error('Invalid user ID'));
    }
    
    const url = `${API_URL}/login-history/${userId}?page=${page}&size=${size}`;
    const headers = mergeHeaders();
    logRequest('GET', url, headers);
    console.log(`Getting login history for user ID: ${userId}, page: ${page}, size: ${size}`);
    
    return axios.get(url, { headers })
      .then(response => {
        console.log(`Successfully retrieved login history for user ${userId}:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`Error fetching login history for user ${userId}:`, error.message);
        console.error('Full error object:', error);
        console.error('URL that failed:', url);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        
        if (!config.useMockData) {
          throw error;
        }
        // Return mock login history data
        return { 
          data: {
            content: [
              {
                id: 1,
                userId: userId,
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                loginTime: new Date().toISOString(),
                success: true
              },
              {
                id: 2,
                userId: userId,
                ipAddress: '192.168.1.101',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                loginTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                success: true
              }
            ],
            totalElements: 2,
            totalPages: 1,
            size: size,
            number: page
          }
        };
      });
  }
}

// Create an instance of the service
const userService = new UserService();

// Export the instance
export { userService }; 