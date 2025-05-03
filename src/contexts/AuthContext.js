import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// This file re-exports the AuthContext created in useAuth.js for compatibility
// with components that import from this path
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in on component mount
    const checkLoginStatus = async () => {
      setIsLoading(true);
      try {
        const token = authService.getToken();
        if (token) {
          // Get user from localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            setIsAuthenticated(true);
            console.log('AuthContext: User loaded from localStorage:', user);
          } else {
            // If token exists but no user, try to fetch current user
            const userData = await authService.getCurrentUser();
            if (userData) {
              setCurrentUser(userData);
              setIsAuthenticated(true);
              console.log('AuthContext: User loaded from API:', userData);
            } else {
              // If getCurrentUser fails, clear invalid token
              authService.logout();
              setIsAuthenticated(false);
              setCurrentUser(null);
            }
          }
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Error checking login status', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = (token, user) => {
    console.log('AuthContext: Login called with user:', user);
    
    // Store token if it's not already stored
    if (token && !authService.getToken()) {
      localStorage.setItem('token', token);
    }
    
    // Store user object if provided
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    console.log('AuthContext: Logout called');
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Check if the user has a specific role
  const hasRole = (role) => {
    if (!currentUser || !currentUser.role) return false;
    
    const userRole = currentUser.role.toUpperCase();
    const checkRole = role.toUpperCase();
    
    if (checkRole.startsWith('ROLE_')) {
      return userRole === checkRole;
    } else {
      return userRole === `ROLE_${checkRole}`;
    }
  };

  // Check if the user is an admin
  const isAdmin = () => {
    return hasRole('ROLE_ADMIN');
  };

  // Check if the user is a lecturer
  const isLecturer = () => {
    return hasRole('ROLE_LECTURER');
  };

  // Check if the user is a student
  const isStudent = () => {
    return hasRole('ROLE_STUDENT');
  };

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    isAdmin,
    isLecturer,
    isStudent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 