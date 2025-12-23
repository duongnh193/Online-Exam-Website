/**
 * Authentication Repository Interface
 * Defines the contract for authentication operations
 */
class IAuthRepository {
  async login(credentials) {
    throw new Error('login() must be implemented');
  }

  async register(userData) {
    throw new Error('register() must be implemented');
  }

  async verifyOtp(otpData) {
    throw new Error('verifyOtp() must be implemented');
  }

  async logout() {
    throw new Error('logout() must be implemented');
  }

  async getCurrentUser() {
    throw new Error('getCurrentUser() must be implemented');
  }

  async enable2FA(userId) {
    throw new Error('enable2FA() must be implemented');
  }

  async disable2FA(userId) {
    throw new Error('disable2FA() must be implemented');
  }

  async is2FAEnabled() {
    throw new Error('is2FAEnabled() must be implemented');
  }

  async resendOtp(usernameOrEmail) {
    throw new Error('resendOtp() must be implemented');
  }

  async resetPassword(emailOrUsername) {
    throw new Error('resetPassword() must be implemented');
  }

  async updatePassword(currentPassword, newPassword) {
    throw new Error('updatePassword() must be implemented');
  }

  getToken() {
    throw new Error('getToken() must be implemented');
  }

  isLoggedIn() {
    throw new Error('isLoggedIn() must be implemented');
  }
}

export default IAuthRepository;

