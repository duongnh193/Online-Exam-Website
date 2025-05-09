import axios from 'axios';
import authHeader from './authHeader';

// API URL
const API_URL = 'http://localhost:8080/api/v1/student-exams';

// Helper for logging API calls in development
const logApiCall = (method, url, headers, body = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${method} ${url}`, { 
      headers: headers ? { ...headers } : 'No headers',
      body: body ? body : 'No body'
    });
  }
};

class StudentExamService {
  // Start an exam for a student
  startExam(examId) {
    const url = `${API_URL}/start?examId=${examId}`;
    logApiCall('POST', url, authHeader());
    return axios.post(url, {}, { headers: authHeader() })
      .then(response => {
        console.log('Exam started successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error starting exam:', error.response?.data || error.message);
        throw error;
      });
  }

  // Submit an answer to a question
  submitAnswer(studentExamId, questionId, answer) {
    const url = `${API_URL}/submit-answer`;
    const payload = {
      studentExamId,
      questionId,
      answer
    };
    logApiCall('POST', url, authHeader(), payload);
    return axios.post(url, payload, { headers: authHeader() })
      .then(response => {
        console.log('Answer submitted successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error submitting answer:', error.response?.data || error.message);
        throw error;
      });
  }

  // Submit the entire exam
  submitExam(studentExamId) {
    const url = `${API_URL}/submit?studentExamId=${studentExamId}`;
    logApiCall('POST', url, authHeader());
    return axios.post(url, {}, { headers: authHeader() })
      .then(response => {
        console.log('Exam submitted successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error submitting exam:', error.response?.data || error.message);
        throw error;
      });
  }
}

export default new StudentExamService(); 