/**
 * Exam Repository Interface
 * Defines the contract for exam operations
 */
class IExamRepository {
  async createExam(examData) {
    throw new Error('createExam() must be implemented');
  }

  async updateExam(examId, examData) {
    throw new Error('updateExam() must be implemented');
  }

  async deleteExam(examId) {
    throw new Error('deleteExam() must be implemented');
  }

  async getExamById(examId) {
    throw new Error('getExamById() must be implemented');
  }

  async getExamsByClass(classId, page = 0, size = 10) {
    throw new Error('getExamsByClass() must be implemented');
  }

  async getExamsByTeacher(teacherId, page = 0, size = 10) {
    throw new Error('getExamsByTeacher() must be implemented');
  }

  async getAllExams(page = 0, size = 10) {
    throw new Error('getAllExams() must be implemented');
  }

  async getExamPassword(examId) {
    throw new Error('getExamPassword() must be implemented');
  }
}

export default IExamRepository;

