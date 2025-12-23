import Question from '../../domain/entities/Question';

/**
 * Question Mapper
 * Converts between API data format and Domain Entity
 */
class QuestionMapper {
  toDomain(apiData) {
    if (!apiData) return null;

    return new Question({
      id: apiData.id,
      examId: apiData.examId || apiData.exam?.id,
      title: apiData.title,
      type: apiData.type,
      choices: apiData.choices || [],
      answer: apiData.answer,
      image: apiData.image,
      creatorId: apiData.creatorId || apiData.user_id || apiData.creator?.id
    });
  }

  toApi(domainEntity) {
    if (!domainEntity) return null;

    return {
      id: domainEntity.id,
      examId: domainEntity.examId,
      title: domainEntity.title,
      type: domainEntity.type,
      choices: domainEntity.choices,
      answer: domainEntity.answer,
      image: domainEntity.image,
      user_id: domainEntity.creatorId
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

export default new QuestionMapper();

