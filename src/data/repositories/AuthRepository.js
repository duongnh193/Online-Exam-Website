import IAuthRepository from '../../domain/repositories/IAuthRepository';
import axiosClient from '../../infrastructure/http/axiosClient';
import localStorage from '../../infrastructure/storage/localStorage';
import UserMapper from '../mappers/UserMapper';
import mockUserService from '../../services/mockUserService';

/**
 * Auth Repository Implementation
 * Implements authentication operations using HTTP client
 */
class AuthRepository extends IAuthRepository {
  constructor() {
    super();
    this.AUTH_URL = '/v1/auth';
    this.USERS_URL = '/v1/users';
  }

  _normalizeBoolean(value) {
    return value === true || value === 'true' || value === 1;
  }

  _parseJwt(token) {
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
  }

  _containsOtpMessage(payload) {
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
  }

  _extractEmailFromOtpMessage(message) {
    if (!message) return null;
    const match = message
      .toString()
      .toLowerCase()
      .match(/otp\s+(has\s+been\s+)?sent\s+to\s+([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i);
    return match ? match[2] : null;
  }

  _getDashboardByRole(role) {
    if (!role) {
      return '/dashboard';
    }

    const roleStr = role.toString().toUpperCase();
    if (roleStr.includes('ADMIN')) return '/admin-dashboard';
    if (roleStr.includes('LECTURER')) return '/lecturer-dashboard';
    if (roleStr.includes('STUDENT')) return '/student-dashboard';
    return '/dashboard';
  }

  _storeToken(token, tokenType) {
    localStorage.setString('token', token);
    localStorage.setString('token_type', tokenType || 'Bearer');
  }

  _storeUser(user) {
    const twoFactorStatus = this._normalizeBoolean(user?.twoFactor ?? user?.twoFactorEnabled);
    const normalised = {
      ...user,
      twoFactorEnabled: twoFactorStatus,
      twoFactor: twoFactorStatus
    };
    localStorage.set('user', normalised);
    return normalised;
  }

  async _fetchUserProfile(userId, token, tokenType) {
    if (!userId) return null;

    try {
      const response = await axiosClient.get(`${this.USERS_URL}/${userId}`, {
        headers: {
          'Authorization': `${tokenType} ${token}`
        }
      });
      if (response?.data) {
        const twoFactorStatus = this._normalizeBoolean(
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
  }

  async _handleAuthSuccess(payload) {
    const token = payload.accessToken;
    const tokenType = payload.tokenType || 'Bearer';
    this._storeToken(token, tokenType);

    const decoded = this._parseJwt(token) || {};
    const baseUser = {
      id: payload.userId ?? decoded.userId ?? decoded.sub,
      username: decoded.sub || payload.username,
      role: decoded.role || payload.role || null
    };

    const profile = await this._fetchUserProfile(baseUser.id, token, tokenType);
    const user = this._storeUser({
      ...baseUser,
      ...(profile || {})
    });

    return {
      token,
      tokenType,
      ...payload,
      user,
      success: true,
      redirectUrl: this._getDashboardByRole(user.role)
    };
  }

  async login(credentials) {
    try {
      const response = await axiosClient.post(`${this.AUTH_URL}/login`, {
        usernameOrEmail: credentials.username,
        password: credentials.password
      });

      if (typeof response.data === 'string' && this._containsOtpMessage(response.data)) {
        return {
          requiresOtp: true,
          username: credentials.username,
          password: credentials.password,
          email: this._extractEmailFromOtpMessage(response.data),
          message: response.data
        };
      }

      return await this._handleAuthSuccess(response.data);
    } catch (error) {
      if (error.response && this._containsOtpMessage(error.response.data)) {
        return {
          requiresOtp: true,
          username: credentials.username,
          password: credentials.password,
          email: this._extractEmailFromOtpMessage(error.response.data),
          message: error.response.data
        };
      }

      console.warn('API login failed, using mock service', error);
      const mockResponse = await mockUserService.findUserByCredentials(
        credentials.username,
        credentials.password
      );

      if (!mockResponse) {
        throw error;
      }

      this._storeToken(mockResponse.accessToken, mockResponse.tokenType);
      const username = mockResponse.user?.username || credentials.username || 'user';
      const inferredRole =
        mockResponse.user?.role ||
        (username.toLowerCase().includes('admin')
          ? 'ROLE_ADMIN'
          : username.toLowerCase().includes('lecturer')
          ? 'ROLE_LECTURER'
          : 'ROLE_STUDENT');

      const mockUser = this._storeUser({
        ...mockResponse.user,
        role: inferredRole
      });

      return {
        token: mockResponse.accessToken,
        tokenType: mockResponse.tokenType || 'Bearer',
        ...mockResponse,
        user: mockUser,
        success: true,
        redirectUrl: this._getDashboardByRole(mockUser.role)
      };
    }
  }

  async register(userData) {
    try {
      const response = await axiosClient.post(`${this.AUTH_URL}/signup`, {
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
  }

  async verifyOtp({ usernameOrEmail, username, password, otp }) {
    const identifier = usernameOrEmail || username;
    if (!identifier) throw new Error('Username or email is required');
    if (!otp) throw new Error('OTP code is required');

    try {
      const response = await axiosClient.post(
        `${this.AUTH_URL}/verify-otp`,
        { usernameOrEmail: identifier, password: password || '' },
        { params: { otp } }
      );

      if (response.data?.accessToken) {
        return await this._handleAuthSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('OTP verification error', error);
      throw error;
    }
  }

  logout() {
    localStorage.remove('token');
    localStorage.remove('token_type');
    localStorage.remove('user');
    localStorage.remove('theme');
    sessionStorage.clear();

    document.cookie
      .split(';')
      .filter(Boolean)
      .forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
  }

  isLoggedIn() {
    return Boolean(localStorage.getString('token'));
  }

  getToken() {
    return localStorage.getString('token');
  }

  async getCurrentUser() {
    const token = localStorage.getString('token');
    if (!token) return null;

    try {
      const response = await axiosClient.get(`${this.AUTH_URL}/me`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current user', error);
      return null;
    }
  }

  async enable2FA(userId) {
    return this._updateTwoFactor(userId, true);
  }

  async disable2FA(userId) {
    return this._updateTwoFactor(userId, false);
  }

  async _updateTwoFactor(userId, enabled) {
    const token = localStorage.getString('token');
    const tokenType = localStorage.getString('token_type') || 'Bearer';
    if (!token) throw new Error('Authentication required');

    const storedUser = localStorage.get('user') || {};
    if (!storedUser?.id) throw new Error('User information not available');

    const response = await axiosClient.put(
      `${this.USERS_URL}/${storedUser.id}/2fa`,
      {},
      {
        params: { twoFA: enabled }
      }
    );

    const updatedUser = {
      ...storedUser,
      twoFactorEnabled: enabled,
      twoFactor: enabled
    };
    this._storeUser(updatedUser);

    return response.data;
  }

  is2FAEnabled() {
    try {
      const stored = localStorage.get('user');
      if (!stored) return false;
      return this._normalizeBoolean(stored?.twoFactor ?? stored?.twoFactorEnabled);
    } catch (error) {
      console.error('Failed to read 2FA status', error);
      return false;
    }
  }

  async resendOtp(usernameOrEmail) {
    if (!usernameOrEmail) throw new Error('Username or email is required');
    try {
      const response = await axiosClient.post(`${this.AUTH_URL}/resend-otp`, null, {
        params: { usernameOrEmail }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to resend OTP', error);
      throw error;
    }
  }

  async resetPassword(emailOrUsername) {
    const identifier =
      typeof emailOrUsername === 'string' ? emailOrUsername : emailOrUsername?.emailOrUsername;
    if (!identifier) throw new Error('Email or username is required');

    try {
      const response = await axiosClient.post(`${this.AUTH_URL}/reset-password`, null, {
        params: { emailOrUsername: identifier }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to reset password', error);
      throw error;
    }
  }

  async updatePassword(currentPassword, newPassword) {
    const token = localStorage.getString('token');
    const tokenType = localStorage.getString('token_type') || 'Bearer';
    if (!token) throw new Error('Authentication required');

    const user = localStorage.get('user') || {};
    if (!user?.id) throw new Error('User information not available');
    if (!currentPassword || !newPassword) throw new Error('Both passwords are required');

    try {
      const response = await axiosClient.put(
        `${this.USERS_URL}/${user.id}/password`,
        { currentPassword, newPassword }
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
  }

  getDashboardByRole(role) {
    return this._getDashboardByRole(role);
  }
}

export default new AuthRepository();

