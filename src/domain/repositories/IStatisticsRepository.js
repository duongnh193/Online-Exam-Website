/**
 * Statistics Repository Interface
 * Defines the contract for statistics operations
 */
class IStatisticsRepository {
  async getTotalClasses() {
    throw new Error('getTotalClasses() must be implemented');
  }

  async getTotalExamsInClass(classId) {
    throw new Error('getTotalExamsInClass() must be implemented');
  }

  async getTotalExams() {
    throw new Error('getTotalExams() must be implemented');
  }

  async getTotalLecturers() {
    throw new Error('getTotalLecturers() must be implemented');
  }

  async getTotalStudents() {
    throw new Error('getTotalStudents() must be implemented');
  }

  async getExamScoreStatistics(examId) {
    throw new Error('getExamScoreStatistics() must be implemented');
  }

  async getStudentScores(classId, page = 0, size = 10) {
    throw new Error('getStudentScores() must be implemented');
  }

  async getStudentScoreByClasses(studentId) {
    throw new Error('getStudentScoreByClasses() must be implemented');
  }
}

export default IStatisticsRepository;

