import axios from 'axios';
import mockUserService from './mockUserService';
import { buildApiUrl } from './apiConfig';

const AUTH_URL = buildApiUrl('/v1/auth');
const USERS_URL = buildApiUrl('/v1/users');

const normaliseBoolean = (value) => value === true || value === 'true' || value === 1;

const getDashboardByRole = (role) => {
  if (!role) {
    return '/dashboard';
  }

  const roleStr = role.toString().toUpperCase();
  if (roleStr.includes('ADMIN')) return '/admin-dashboard';
  if (roleStr.includes('LECTURER')) return '/lecturer-dashboard';
  if (roleStr.includes('STUDENT')) return '/student-dashboard';
  return '/dashboard';
};

const containsOtpMessage = (payload) => {
  const extract = (text) => {
    if (!text) return false;
    return /otp\s+(has\s+been\s+)?sent\s+to/i.test(text.toString().toLowerCase());
  };

  if (!payload) return false;
  if (typeof payload === 'string') return extract(payload);
  if (payload.message && extract(payload.message)) return true;
  if (payload.data) {
    if (typeof payload.data === 'string') return extract(payload.data);
    if (payload.data.message) return extract(payload.data.message);
  }
  return false;
};

const extractEmailFromOtpMessage = (message) => {
  if (!message) return null;
  const match = message
    .toString()
    .toLowerCase()
    .match(/otp\s+(has\s+been\s+)?sent\s+to\s+([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i);
  return match ? match[2] : null;
};

const parseJwt = (token) => {
  try {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      return null;
    }
    const [, base64Url] = token.split('.');
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token', error);
    return null;
  }
};

const buildAuthHeader = (token, tokenType = 'Bearer') => ({
  Authorization: `${tokenType} ${token}`
});

const storeToken = (token, tokenType) => {
  localStorage.setItem('token', token);
  localStorage.setItem('token_type', tokenType || 'Bearer');
};

const storeUser = (user) => {
  const twoFactorStatus = normaliseBoolean(user?.twoFactor ?? user?.twoFactorEnabled);
  const normalised = {
    ...user,
    twoFactorEnabled: twoFactorStatus,
    twoFactor: twoFactorStatus
  };
  localStorage.setItem('user', JSON.stringify(normalised));
  return normalised;
};

const fetchUserProfile = async (userId, token, tokenType) => {
  if (!userId) return null;

  try {
    const response = await axios.get(`${USERS_URL}/${userId}`, {
      headers: buildAuthHeader(token, tokenType),
      timeout: 10000
    });
    if (response?.data) {
      const twoFactorStatus = normaliseBoolean(
        response.data.twoFactor ?? response.data.twoFactorEnabled
      );
      return {
        ...response.data,
        twoFactorEnabled: twoFactorStatus,
        twoFactor: twoFactorStatus
      };
    }
  } catch (error) {
    console.error('Failed to fetch user profile', error);
  }
  return null;
};

const handleAuthSuccess = async (payload) => {
  const token = payload.accessToken;
  const tokenType = payload.tokenType || 'Bearer';
  storeToken(token, tokenType);

  const decoded = parseJwt(token) || {};
  const baseUser = {
    id: payload.userId ?? decoded.userId ?? decoded.sub,
    username: decoded.sub || payload.username,
    role: decoded.role || payload.role || null
  };

  const profile = await fetchUserProfile(baseUser.id, token, tokenType);
  const user = storeUser({
    ...baseUser,
    ...(profile || {})
  });

  return {
    token,
    tokenType,
    ...payload,
    user,
    success: true,
    redirectUrl: getDashboardByRole(user.role)
  };
};

const buildOtpResponse = (payload, credentials) => ({
  requiresOtp: true,
  username: credentials.username,
  password: credentials.password,
  email: extractEmailFromOtpMessage(payload),
  message: payload
});

const login = async (credentials) => {
  try {
    const response = await axios.post(`${AUTH_URL}/login`, {
      usernameOrEmail: credentials.username,
      password: credentials.password
    });

    if (typeof response.data === 'string' && containsOtpMessage(response.data)) {
      return buildOtpResponse(response.data, credentials);
    }

    return await handleAuthSuccess(response.data);
  } catch (error) {
    if (error.response && containsOtpMessage(error.response.data)) {
      return buildOtpResponse(error.response.data, credentials);
    }

    console.warn('API login failed, using mock service', error);
    const mockResponse = await mockUserService.findUserByCredentials(
      credentials.username,
      credentials.password
    );

    if (!mockResponse) {
      throw error;
    }

    storeToken(mockResponse.accessToken, mockResponse.tokenType);
    const username = mockResponse.user?.username || credentials.username || 'user';
    const inferredRole =
      mockResponse.user?.role ||
      (username.toLowerCase().includes('admin')
        ? 'ROLE_ADMIN'
        : username.toLowerCase().includes('lecturer')
        ? 'ROLE_LECTURER'
        : 'ROLE_STUDENT');

    const mockUser = storeUser({
      ...mockResponse.user,
      role: inferredRole
    });

    return {
      token: mockResponse.accessToken,
      tokenType: mockResponse.tokenType || 'Bearer',
      ...mockResponse,
      user: mockUser,
      success: true,
      redirectUrl: getDashboardByRole(mockUser.role)
    };
  }
};

const register = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_URL}/signup`, {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role
    });
    return response.data;
  } catch (error) {
    console.error('Registration error', error);
    throw error;
  }
};

const verifyOtp = async ({ usernameOrEmail, username, password, otp }) => {
  const identifier = usernameOrEmail || username;
  if (!identifier) throw new Error('Username or email is required');
  if (!otp) throw new Error('OTP code is required');

  try {
    const response = await axios.post(
      `${AUTH_URL}/verify-otp`,
      { usernameOrEmail: identifier, password: password || '' },
      { params: { otp } }
    );

    if (response.data?.accessToken) {
      return await handleAuthSuccess(response.data);
    }

    return response.data;
  } catch (error) {
    console.error('OTP verification error', error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('user');
  sessionStorage.clear();

  document.cookie
    .split(';')
    .filter(Boolean)
    .forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
};

const isLoggedIn = () => Boolean(localStorage.getItem('token'));

const getToken = () => localStorage.getItem('token');

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('token_type') || 'Bearer';
  return token ? buildAuthHeader(token, tokenType) : {};
};

const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await axios.get(`${AUTH_URL}/me`, {
      headers: buildAuthHeader(token, localStorage.getItem('token_type') || 'Bearer')
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch current user', error);
    return null;
  }
};

const updateTwoFactor = async (enabled) => {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('token_type') || 'Bearer';
  if (!token) throw new Error('Authentication required');

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (!storedUser?.id) throw new Error('User information not available');

  const response = await axios.put(
    `${USERS_URL}/${storedUser.id}/2fa`,
    {},
    {
      params: { twoFA: enabled },
      headers: buildAuthHeader(token, tokenType),
      timeout: 10000
    }
  );

  const updatedUser = {
    ...storedUser,
    twoFactorEnabled: enabled,
    twoFactor: enabled
  };
  storeUser(updatedUser);

  return response.data;
};

const enable2FA = () => updateTwoFactor(true);
const disable2FA = () => updateTwoFactor(false);

const is2FAEnabled = () => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return false;
    const user = JSON.parse(stored);
    return normaliseBoolean(user?.twoFactor ?? user?.twoFactorEnabled);
  } catch (error) {
    console.error('Failed to read 2FA status', error);
    return false;
  }
};

const resendOtp = async (usernameOrEmail) => {
  if (!usernameOrEmail) throw new Error('Username or email is required');
  try {
    const response = await axios.post(`${AUTH_URL}/resend-otp`, null, {
      params: { usernameOrEmail }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to resend OTP', error);
    throw error;
  }
};

const resetPassword = async (emailOrUsername) => {
  const identifier =
    typeof emailOrUsername === 'string' ? emailOrUsername : emailOrUsername?.emailOrUsername;
  if (!identifier) throw new Error('Email or username is required');

  try {
    const response = await axios.post(`${AUTH_URL}/reset-password`, null, {
      params: { emailOrUsername: identifier }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to reset password', error);
    throw error;
  }
};

const updatePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('token_type') || 'Bearer';
  if (!token) throw new Error('Authentication required');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user?.id) throw new Error('User information not available');
  if (!currentPassword || !newPassword) throw new Error('Both passwords are required');

  try {
    const response = await axios.put(
      `${USERS_URL}/${user.id}/password`,
      { currentPassword, newPassword },
      {
        headers: buildAuthHeader(token, tokenType),
        timeout: 10000
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) throw new Error('Current password is incorrect');
      if (status === 403) throw new Error('You are not authorised to update this password');
      if (status === 404) throw new Error('User not found');
      if (status === 400 && data?.message) throw new Error(data.message);
      if (status === 500) throw new Error('Server error occurred. Please try again later.');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

const authService = {
  register,
  login,
  verifyOtp,
  logout,
  isLoggedIn,
  getToken,
  getAuthHeader,
  getCurrentUser,
  enable2FA,
  disable2FA,
  is2FAEnabled,
  resendOtp,
  resetPassword,
  updatePassword,
  getDashboardByRole
};

export default authService;
