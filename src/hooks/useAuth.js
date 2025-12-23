import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useLoading } from '../contexts/LoadingContext';

// Create the AuthContext and export it so it can be imported elsewhere
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    if (!isLoading) {
      hideLoader();
      return undefined;
    }

    showLoader();
    return () => {
      hideLoader();
    };
  }, [isLoading, showLoader, hideLoader]);

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
            
            if (userData && userData.role) {
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              console.warn('User data missing or incomplete in localStorage');
              
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
                  
                  if (decodedToken && decodedToken.role) {
                    
                    // Update user data with role
                    const updatedUserData = {
                      ...userData,
                      role: decodedToken.role
                    };
                    
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

  // Check if we're returning from a logout
  useEffect(() => {
    // Check if we have a logout parameter in the URL
    if (location && location.search) {
      const queryParams = new URLSearchParams(location.search);
      const hasLogoutParam = queryParams.has('logout');
      
      if (hasLogoutParam) {
        // Double-check that all auth data is cleared
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Remove the logout parameter to prevent confusion
        queryParams.delete('logout');
        const newSearch = queryParams.toString();
        const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');
        
        // Update URL without triggering refresh
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [location]);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.user) {
        
        // Normalize role for comparison (uppercase)
        const role = response.user?.role?.toUpperCase();
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Add direct navigation based on normalized role
        if (role === 'ROLE_LECTURER' || role === 'ROLE_ADMIN') {
          
          // Use window.location for hard refresh navigation
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        } else if (role === 'ROLE_STUDENT') {
          
          // Use window.location for hard refresh navigation
          setTimeout(() => {
            window.location.href = '/student-dashboard';
          }, 100);
        } else {
          console.warn('useAuth: No recognized role for redirection, user:', response.user);
          window.location.href = '/';
        }
      } else if (response.requiresOtp) {
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
      const response = await authService.verifyOtp(verificationData);
      
      if (response.success && response.user) {
        
        // Normalize role for comparison (uppercase)
        const role = response.user?.role?.toUpperCase();
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Add direct navigation based on normalized role
        if (role === 'ROLE_LECTURER' || role === 'ROLE_ADMIN') {
          
          // Use window.location for hard refresh navigation
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        } else if (role === 'ROLE_STUDENT') {
          
          // Use window.location for hard refresh navigation
          setTimeout(() => {
            window.location.href = '/student-dashboard';
          }, 100);
        } else {
          console.warn('useAuth: No recognized role for redirection after OTP, user:', response.user);
          window.location.href = '/';
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
    
    // Clear all auth-related data
    authService.logout();
    localStorage.removeItem('theme');
    
    // Set local state to logged out
    setUser(null);
    setIsAuthenticated(false);
    
    // Force a hard refresh of the page to ensure clean state
    // This is more reliable than just navigating
    window.location.href = '/';
  };

  // Add a function to refresh user data from localStorage
  const refreshUser = useCallback(async () => {
    try {
      const storedUserData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUserData && token) {
        const userData = JSON.parse(storedUserData);
        
        // Try to refresh from API if we have a userId
        if (userData && userData.id) {
          try {
            const userResponse = await fetch(`http://localhost:8080/api/v1/users/${userData.id}`, {
              headers: {
                'Authorization': `${localStorage.getItem('token_type') || 'Bearer'} ${token}`
              }
            });
            
            if (userResponse.ok) {
              const apiUserData = await userResponse.json();
              
              // Normalize the 2FA status to ensure consistent boolean values
              const twoFactorStatus = apiUserData.twoFactor === true || 
                                     apiUserData.twoFactor === "true" || 
                                     apiUserData.twoFactor === 1;
              
              // Update the user data with the API response and ensure 2FA status is boolean
              const updatedUserData = {
                ...userData,
                ...apiUserData,
                twoFactorEnabled: twoFactorStatus,
                twoFactor: twoFactorStatus
              };
              
              // Update localStorage with the refreshed data
              localStorage.setItem('user', JSON.stringify(updatedUserData));
              
              // Only update if the data is different
              if (JSON.stringify(updatedUserData) !== JSON.stringify(user)) {
                
                // Reset any caching mechanisms in the app
                window.__resetUserDataCache = true;
                
                setUser(updatedUserData);
              }
              
              return updatedUserData;
            }
          } catch (apiError) {
            console.error('useAuth: Error fetching user data from API:', apiError);
            // Fall back to localStorage data
          }
        }
        
        // Only update if the data is different
        if (JSON.stringify(userData) !== JSON.stringify(user)) {
          
          // Reset any caching mechanisms in the app
          // This will trigger re-fetches of data that depends on user state
          window.__resetUserDataCache = true;
          
          setUser(userData);
        } else {
        }
        
        return userData;
      }
      
      return user;
    } catch (error) {
      console.error('useAuth: Error refreshing user data:', error);
      return user;
    }
  }, [user]);

  // Add an effect to refresh user data when navigating to the settings page
  useEffect(() => {
    if (location.pathname === '/settings' && isAuthenticated) {
      // Handle the async refreshUser function properly
      (async () => {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Error refreshing user on navigation:', error);
        }
      })();
    }
  }, [location.pathname, isAuthenticated]);

  const value = useMemo(() => ({
    user,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    verifyOtp,
    refreshUser
  }), [user, isAuthenticated, isLoading, login, register, logout, verifyOtp, refreshUser]);

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
