/**
 * Helper function to retrieve the authentication token from localStorage
 * and return it in the format expected by the API for authenticated requests
 */
export default function authHeader() {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('token_type') || 'Bearer';
  
  if (token) {
    // Return authorization header with JWT token
    return { 
      'Authorization': `${tokenType} ${token}`,
      'Content-Type': 'application/json'
    };
  } else {
    // Return only content type header if no token available
    return {
      'Content-Type': 'application/json'
    };
  }
} 
