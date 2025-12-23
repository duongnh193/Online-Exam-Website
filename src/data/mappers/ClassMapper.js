import Class from '../../domain/entities/Class';

/**
 * Class Mapper
 * Converts between API data format and Domain Entity
 */
class ClassMapper {
  toDomain(apiData) {
    if (!apiData) return null;

    return new Class({
      id: apiData.id,
      name: apiData.name,
      description: apiData.description,
      teacherId: apiData.teacherId || apiData.teacher?.id,
      studentCount: apiData.studentCount,
      examCount: apiData.examCount
    });
  }

  toApi(domainEntity) {
    if (!domainEntity) return null;

    return {
      id: domainEntity.id,
      name: domainEntity.name,
      description: domainEntity.description,
      teacherId: domainEntity.teacherId
    };
  }

  toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) {
      if (apiDataList.content) {
        return apiDataList.content.map(item => this.toDomain(item));
      }
      return [];
    }
    return apiDataList.map(item => this.toDomain(item));
  }
}

export default new ClassMapper();

