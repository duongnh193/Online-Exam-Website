import axios from 'axios';
import { buildApiUrl } from '../../services/apiConfig';

/**
 * Axios HTTP Client for making API requests
 * This is the infrastructure layer - handles low-level HTTP communication
 */
class AxiosClient {
  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth headers
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        const tokenType = localStorage.getItem('token_type') || 'Bearer';
        
        if (token) {
          config.headers.Authorization = `${tokenType} ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - could dispatch logout action here
          console.warn('Unauthorized request - token may be expired');
        }
        return Promise.reject(error);
      }
    );
  }

  get(url, config = {}) {
    return this.client.get(buildApiUrl(url), config);
  }

  post(url, data, config = {}) {
    return this.client.post(buildApiUrl(url), data, config);
  }

  put(url, data, config = {}) {
    return this.client.put(buildApiUrl(url), data, config);
  }

  delete(url, config = {}) {
    return this.client.delete(buildApiUrl(url), config);
  }

  patch(url, data, config = {}) {
    return this.client.patch(buildApiUrl(url), data, config);
  }
}

export default new AxiosClient();

