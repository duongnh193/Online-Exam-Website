import IStatisticsRepository from '../../domain/repositories/IStatisticsRepository';
import axiosClient from '../../infrastructure/http/axiosClient';

/**
 * Statistics Repository Implementation
 */
class StatisticsRepository extends IStatisticsRepository {
  constructor() {
    super();
    this.API_URL = '/v1/statistics';
  }

  async getTotalClasses() {
    const url = `${this.API_URL}/total-classes`;
    const response = await axiosClient.get(url);
    return response.data;
  }

  async getTotalExamsInClass(classId) {
    if (!classId) {
      throw new Error('Invalid class ID');
    }
    
    const url = `${this.API_URL}/total-exams/${classId}`;
    const response = await axiosClient.get(url);
    return response.data;
  }

  async getTotalExams() {
    const url = `${this.API_URL}/total-exam`;
    const response = await axiosClient.get(url);
    return response.data;
  }

  async getTotalLecturers() {
    const url = `${this.API_URL}/total-lecturers`;
    const response = await axiosClient.get(url);
    return response.data;
  }

  async getTotalStudents() {
    const url = `${this.API_URL}/total-students`;
    const response = await axiosClient.get(url);
    return response.data;
  }

  async getExamScoreStatistics(examId) {
    if (!examId) {
      throw new Error('Invalid exam ID');
    }
    
    const url = `${this.API_URL}/exam-score/${examId}`;
    const response = await axiosClient.get(url);
    return response.data;
  }

  async getStudentScores(classId, page = 0, size = 10, direction = 'asc') {
    if (!classId) {
      throw new Error('Invalid class ID');
    }
    
    const url = `${this.API_URL}/student-scores/${classId}?page=${page}&size=${size}&direction=${direction}`;
    const response = await axiosClient.get(url);
    return response.data;
  }

  async getStudentScoreByClasses(studentId) {
    if (!studentId) {
      throw new Error('Invalid student ID');
    }
    
    const url = `${this.API_URL}/student-score-in-classes/${studentId}`;
    
    try {
      const response = await axiosClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching student scores:', error);
      throw error;
    }
  }
}

export default new StatisticsRepository();

