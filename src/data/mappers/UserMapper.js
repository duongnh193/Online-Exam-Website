import User from '../../domain/entities/User';

/**
 * User Mapper
 * Converts between API data format and Domain Entity
 */
class UserMapper {
  toDomain(apiData) {
    if (!apiData) return null;

    return new User({
      id: apiData.id,
      username: apiData.username,
      email: apiData.email,
      firstName: apiData.firstName,
      lastName: apiData.lastName,
      role: apiData.role,
      image: apiData.image,
      twoFactorEnabled: apiData.twoFactorEnabled || apiData.twoFactor === true || apiData.twoFactor === 'true' || apiData.twoFactor === 1,
      createdAt: apiData.createAt || apiData.createdAt,
      updatedAt: apiData.updateAt || apiData.updatedAt
    });
  }

  toApi(domainEntity) {
    if (!domainEntity) return null;

    return {
      id: domainEntity.id,
      username: domainEntity.username,
      email: domainEntity.email,
      firstName: domainEntity.firstName,
      lastName: domainEntity.lastName,
      role: domainEntity.role,
      image: domainEntity.image,
      twoFactor: domainEntity.twoFactorEnabled
    };
  }
}

export default new UserMapper();

