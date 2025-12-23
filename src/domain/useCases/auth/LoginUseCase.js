/**
 * Login Use Case
 * Contains business logic for user authentication
 */
import authRepository from '../../../data/repositories/AuthRepository';
import UserMapper from '../../../data/mappers/UserMapper';

class LoginUseCase {
  async execute(credentials) {
    // Validate input
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }
    
    // Authenticate via repository
    const response = await authRepository.login(credentials);
    
    // Handle OTP requirement
    if (response.requiresOtp) {
      return {
        requiresOtp: true,
        username: credentials.username,
        password: credentials.password,
        email: response.email,
        message: response.message
      };
    }
    
    // Convert user to domain entity if available
    if (response.user) {
      const user = UserMapper.toDomain(response.user);
      return {
        ...response,
        user: user // Domain entity
      };
    }
    
    return response;
  }
}

export default new LoginUseCase();

