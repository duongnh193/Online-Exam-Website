import axios from 'axios';
import authHeader from './authHeader';

// API URL
const API_URL = 'http://localhost:8080/api/v1/exams';

// Helper for logging API calls in development
const logApiCall = (method, url, headers, body = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${method} ${url}`, { 
      headers: headers ? { ...headers } : 'No headers',
      body: body ? body : 'No body'
    });
  }
};

class ExamService {
  // Create a new exam
  createExam(examData) {
    logApiCall('POST', API_URL, authHeader(), examData);
    return axios.post(API_URL, examData, { headers: authHeader() })
      .then(response => {
        console.log('Exam created successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error creating exam:', error.response?.data || error.message);
        throw error;
      });
  }

  // Update an existing exam
  updateExam(examId, examData) {
    const url = `${API_URL}/${examId}`;
    logApiCall('PUT', url, authHeader(), examData);
    return axios.put(url, examData, { headers: authHeader() })
      .then(response => {
        console.log('Exam updated successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error updating exam:', error.response?.data || error.message);
        throw error;
      });
  }

  // Delete an exam
  deleteExam(examId) {
    const url = `${API_URL}/${examId}`;
    logApiCall('DELETE', url, authHeader());
    return axios.delete(url, { headers: authHeader() })
      .then(response => {
        console.log('Exam deleted successfully');
        return response;
      })
      .catch(error => {
        console.error('Error deleting exam:', error.response?.data || error.message);
        throw error;
      });
  }

  // Get exam by ID
  getExamById(examId) {
    const url = `${API_URL}/${examId}`;
    logApiCall('GET', url, authHeader());
    return axios.get(url, { headers: authHeader() })
      .then(response => {
        console.log('Exam fetched successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error fetching exam:', error.response?.data || error.message);
        throw error;
      });
  }

  // Get exams by class ID
  getExamsByClass(classId, page = 0, size = 10, status = null) {
    // Build URL with classId and pagination
    let url = `${API_URL}?classId=${classId}&page=${page}&size=${size}`;
    
    // Add status filter if provided
    if (status) {
      url += `&status=${status}`;
    }
    
    logApiCall('GET', url, authHeader());
    
    return axios.get(url, { 
      headers: authHeader(),
      timeout: 10000 // 10 second timeout
    })
    .then(response => {
      console.log('Exams fetched successfully:', response.data);
      
      // Add detailed logging to debug the response
      if (response.data && response.data.content) {
        console.log(`Received ${response.data.content.length} exams (paginated)`);
      } else if (Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} exams (array)`);
      } else {
        console.warn('Unexpected response format:', response.data);
      }
      
      return response;
    })
    .catch(error => {
      console.error('Error fetching exams:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error details:', error.response);
      throw error;
    });
  }
}

export default new ExamService(); 