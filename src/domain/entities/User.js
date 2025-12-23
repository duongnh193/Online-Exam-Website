/**
 * User Domain Entity
 * Represents the core User business object
 */
class User {
  constructor({
    id,
    username,
    email,
    firstName,
    lastName,
    role,
    image,
    twoFactorEnabled = false,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.image = image;
    this.twoFactorEnabled = twoFactorEnabled;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get fullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.username;
  }

  isAdmin() {
    return this.role?.toUpperCase().includes('ADMIN');
  }

  isLecturer() {
    return this.role?.toUpperCase().includes('LECTURER');
  }

  isStudent() {
    return this.role?.toUpperCase().includes('STUDENT');
  }

  hasRole(role) {
    const userRole = this.role?.toUpperCase() || '';
    const checkRole = role.toUpperCase();
    
    if (checkRole.startsWith('ROLE_')) {
      return userRole === checkRole;
    }
    return userRole === `ROLE_${checkRole}`;
  }
}

export default User;

