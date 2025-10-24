import axios from 'axios';
import { authHeader, logApiCall, logAuthState } from '../utils/authUtils';
import { buildApiUrl } from './apiConfig';

const API_URL = buildApiUrl('/v1/statistics');

class StatisticsService {
  // Lấy tổng số lớp
  getTotalClasses() {
    logAuthState();
    const url = `${API_URL}/total-classes`;
    const headers = authHeader();
    
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }

  // Lấy tổng số bài thi trong một lớp
  getTotalExamsInClass(classId) {
    if (!classId) {
      console.error('getTotalExamsInClass: Invalid class ID');
      return Promise.reject(new Error('Invalid class ID'));
    }
    
    logAuthState();
    const url = `${API_URL}/total-exams/${classId}`;
    const headers = authHeader();
    
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }
  
  // Lấy tổng số bài thi
  getTotalExams() {
    logAuthState();
    const url = `${API_URL}/total-exam`;
    const headers = authHeader();
    
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }
  
  // Lấy tổng số giảng viên
  getTotalLecturers() {
    logAuthState();
    const url = `${API_URL}/total-lecturers`;
    const headers = authHeader();
    
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }
  
  // Lấy tổng số học sinh
  getTotalStudents() {
    logAuthState();
    const url = `${API_URL}/total-students`;
    const headers = authHeader();
    
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }
  
  // Lấy thống kê điểm của một bài thi
  getExamScoreStatistics(examId) {
    if (!examId) {
      console.error('getExamScoreStatistics: Invalid exam ID');
      return Promise.reject(new Error('Invalid exam ID'));
    }
    
    logAuthState();
    const url = `${API_URL}/exam-score/${examId}`;
    const headers = authHeader();
    
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }
  
  // Lấy điểm của các học sinh trong một lớp
  getStudentScores(classId, page = 0, size = 10, direction = 'asc') {
    if (!classId) {
      console.error('getStudentScores: Invalid class ID');
      return Promise.reject(new Error('Invalid class ID'));
    }
    
    logAuthState();
    const url = `${API_URL}/student-scores/${classId}?page=${page}&size=${size}&direction=${direction}`;
    const headers = authHeader();
    
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }
  
  // Lấy điểm của một học sinh trong tất cả các lớp
  getStudentScoreByClasses(studentId) {
    if (!studentId) {
      console.error('getStudentScoreByClasses: Invalid student ID');
      return Promise.reject(new Error('Invalid student ID'));
    }
    
    logAuthState();
    const url = `${API_URL}/student-score-in-classes/${studentId}`;
    const headers = authHeader();
    
    console.log(`Fetching scores for student ID: ${studentId}`);
    logApiCall('GET', url, headers);
    
    return axios.get(url, { headers })
      .then(response => {
        console.log('Student scores data retrieved:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error fetching student scores:', error);
        throw error;
      });
  }
}

const statisticsService = new StatisticsService();
export default statisticsService; 
