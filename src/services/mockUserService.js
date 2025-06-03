// Local storage keys
const USERS_STORAGE_KEY = 'mock_users';
const CURRENT_USER_KEY = 'current_user';

// Helper functions for local storage
const getUsers = () => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  if (usersJson) {
    return JSON.parse(usersJson);
  }
  
  // If no users exist, create default users
  const defaultUsers = [
    {
      id: '1',
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
      createdAt: new Date().toISOString(),
      emailVerified: true,
      twoFactor: false
    },
    {
      id: '2',
      username: 'lecturer',
      password: 'password',
      email: 'lecturer@example.com',
      createdAt: new Date().toISOString(),
      emailVerified: true,
      twoFactor: false
    },
    {
      id: '3',
      username: 'student',
      password: 'password',
      email: 'student@example.com',
      createdAt: new Date().toISOString(),
      emailVerified: true,
      twoFactor: false
    }
  ];
  
  // Save default users to localStorage
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  console.log('Created default mock users:', defaultUsers);
  return defaultUsers;
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Mock user service with localStorage persistence
const mockUserService = {
  // Create a new user
  createUser: (userData) => {
    const users = getUsers();
    
    // Check if username already exists
    if (users.some(user => user.username === userData.username)) {
      return Promise.reject({ message: 'Username already exists' });
    }
    
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
      return Promise.reject({ message: 'Email already exists' });
    }
    
    // Create the user with a mock ID
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      emailVerified: false,
      twoFactor: userData.twoFactor || false
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return Promise.resolve({
      user: {...newUser, password: undefined}, // Don't return the password
      accessToken: `mock_token_${newUser.id}`,
      tokenType: 'Bearer'
    });
  },
  
  // Find user by username and password
  findUserByCredentials: (username, password) => {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return Promise.reject({ message: 'Invalid credentials' });
    }
    
    return Promise.resolve({
      user: {...user, password: undefined}, // Don't return the password
      accessToken: `mock_token_${user.id}`,
      tokenType: 'Bearer'
    });
  },
  
  // Find user by token
  findUserByToken: (token) => {
    if (!token || !token.startsWith('mock_token_')) {
      return Promise.reject({ message: 'Invalid token' });
    }
    
    const userId = token.replace('mock_token_', '');
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return Promise.reject({ message: 'User not found' });
    }
    
    return Promise.resolve({...user, password: undefined});
  },
  
  // Save current user to local storage
  saveCurrentUser: (user) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },
  
  // Get current user from local storage
  getCurrentUser: () => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
  
  // Clear current user
  clearCurrentUser: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
  
  // Check if a token is a mock token
  isMockToken: (token) => {
    return token && token.startsWith('mock_token_');
  },
  
  // Verify OTP (mock implementation)
  verifyOtp: (username, password, otp) => {
    // This is just a mock that accepts any 6-digit OTP
    if (otp && otp.length === 6 && /^\d+$/.test(otp)) {
      return mockUserService.findUserByCredentials(username, password);
    }
    return Promise.reject({ message: 'Invalid OTP' });
  }
};

export default mockUserService; 