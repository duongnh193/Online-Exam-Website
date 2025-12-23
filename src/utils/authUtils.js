/**
 * Authentication utility functions for the application
 */

/**
 * Helper function to retrieve the authentication token from localStorage
 * and return it in the format expected by the API for authenticated requests
 */
export function authHeader() {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('token_type') || 'Bearer';

  if (token) {
    // Return authorization header with JWT token
    return { 
      'Authorization': `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    };
  } else {
    console.warn('⚠️ No token found in localStorage! Authentication will fail.');
    
    // Return only content type header if no token available
    return {
      'Content-Type': 'application/json'
    };
  }
}

/**
 * Helper for logging API calls in development
 */
export function logApiCall(method, url, headers, body = null) {
  return { method, url, headers, body };
}

/**
 * Print current authentication state
 */
export function logAuthState() {
  return localStorage.getItem('token');
}
