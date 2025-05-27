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
  
  console.log('authHeader() called - token exists:', !!token);
  
  if (token) {
    // Log token details for debugging (safely)
    const tokenPreview = token.length > 10 ? 
      `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : 
      '[too short]';
    console.log(`Token type: ${tokenType}, Token preview: ${tokenPreview}, Length: ${token.length}`);
    
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
  console.log(`🔄 ${method} ${url}`, { 
    headers: headers ? { 
      Authorization: headers.Authorization ? `${headers.Authorization.substring(0, 15)}...` : 'None',
      'Content-Type': headers['Content-Type'] || 'Not set'
    } : 'No headers',
    body: body ? (typeof body === 'object' ? 'Object payload' : body) : 'No body'
  });
}

/**
 * Print current authentication state
 */
export function logAuthState() {
  const token = localStorage.getItem('token');
  console.log('Auth state check - Token exists:', !!token);
  if (token) {
    console.log('Token length:', token.length);
    console.log('Token prefix:', token.substring(0, 10) + '...');
  }
} 