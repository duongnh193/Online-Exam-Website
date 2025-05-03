/**
 * Helper function to retrieve the authentication token from localStorage
 * and return it in the format expected by the API for authenticated requests
 */
export default function authHeader() {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('token_type') || 'Bearer';
  
  console.log('authHeader() called - token exists:', !!token);
  
  if (token) {
    // Return authorization header with JWT token
    console.log('Token type:', tokenType);
    console.log('Token (first 10 chars):', token.substring(0, 10) + '...');
    
    return { 
      'Authorization': `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    };
  } else {
    console.warn('No token found in localStorage!');
    
    // Return only content type header if no token available
    return {
      'Content-Type': 'application/json'
    };
  }
} 