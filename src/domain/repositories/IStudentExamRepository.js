/**
 * Student Exam Repository Interface
 * Defines the contract for student exam operations
 */
class IStudentExamRepository {
  async startExam(examId, password) {
    throw new Error('startExam() must be implemented');
  }

  async submitAnswer(studentExamId, questionId, answer, currentQuestionIndex) {
    throw new Error('submitAnswer() must be implemented');
  }

  async getQuestion(studentExamId, questionIndex) {
    throw new Error('getQuestion() must be implemented');
  }

  async submitExam(studentExamId) {
    throw new Error('submitExam() must be implemented');
  }

  async getStudentExamResult(studentExamId) {
    throw new Error('getStudentExamResult() must be implemented');
  }

  async checkExamStatus(examId) {
    throw new Error('checkExamStatus() must be implemented');
  }

  async getStudentExamsByExamId(examId) {
    throw new Error('getStudentExamsByExamId() must be implemented');
  }

  async getStudentExamDetail(studentExamId) {
    throw new Error('getStudentExamDetail() must be implemented');
  }

  async checkTab(studentExamId) {
    throw new Error('checkTab() must be implemented');
  }
}

export default IStudentExamRepository;

