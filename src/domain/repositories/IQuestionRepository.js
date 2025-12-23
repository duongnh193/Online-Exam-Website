/**
 * Question Repository Interface
 * Defines the contract for question operations
 */
class IQuestionRepository {
  async createQuestion(questionData) {
    throw new Error('createQuestion() must be implemented');
  }

  async updateQuestion(questionId, questionData) {
    throw new Error('updateQuestion() must be implemented');
  }

  async deleteQuestion(questionId) {
    throw new Error('deleteQuestion() must be implemented');
  }

  async getQuestionById(questionId) {
    throw new Error('getQuestionById() must be implemented');
  }

  async getQuestionsByExam(examId, page = 0, size = 10) {
    throw new Error('getQuestionsByExam() must be implemented');
  }

  async getAllQuestionsInExam(examId) {
    throw new Error('getAllQuestionsInExam() must be implemented');
  }

  async importQuestionsFromCsv(file, examId) {
    throw new Error('importQuestionsFromCsv() must be implemented');
  }
}

export default IQuestionRepository;

