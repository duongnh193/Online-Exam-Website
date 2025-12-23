import Exam from '../../domain/entities/Exam';

/**
 * Exam Mapper
 * Converts between API data format and Domain Entity
 */
class ExamMapper {
  toDomain(apiData) {
    if (!apiData) return null;

    return new Exam({
      id: apiData.id,
      title: apiData.title,
      classId: apiData.classId || apiData.class?.id,
      duration: apiData.duration,
      startAt: apiData.startAt,
      endAt: apiData.endAt,
      status: apiData.status,
      password: apiData.password,
      reviewMode: apiData.reviewMode,
      questions: apiData.questions || [],
      creator: apiData.creator,
      teacher: apiData.teacher
    });
  }

  toApi(domainEntity) {
    if (!domainEntity) return null;

    return {
      id: domainEntity.id,
      title: domainEntity.title,
      classId: domainEntity.classId,
      duration: domainEntity.duration,
      startAt: domainEntity.startAt instanceof Date ? domainEntity.startAt.toISOString() : domainEntity.startAt,
      endAt: domainEntity.endAt instanceof Date ? domainEntity.endAt.toISOString() : domainEntity.endAt,
      status: domainEntity.status,
      password: domainEntity.password,
      reviewMode: domainEntity.reviewMode
    };
  }

  toDomainList(apiDataList) {
    if (!Array.isArray(apiDataList)) {
      // Handle paginated response
      if (apiDataList.content) {
        return apiDataList.content.map(item => this.toDomain(item));
      }
      return [];
    }
    return apiDataList.map(item => this.toDomain(item));
  }
}

export default new ExamMapper();

