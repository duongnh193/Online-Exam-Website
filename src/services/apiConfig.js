const resolveBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined') {
    if (window.__APP_API_URL__) {
      return window.__APP_API_URL__;
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
  }

  return '/api';
};

const rawBase = resolveBaseUrl();
const API_BASE = rawBase.endsWith('/') && rawBase !== '/' ? rawBase.slice(0, -1) : rawBase;

export const buildApiUrl = (path = '') => {
  if (!path) {
    return API_BASE;
  }

  if (path === '/') {
    return API_BASE;
  }

  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};

export default API_BASE;
