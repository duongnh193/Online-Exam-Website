import axios from 'axios';
import authHeader from './authHeader';

// API URL
const API_URL = 'http://localhost:8080/api/v1/questions';

// Helper for logging API calls in development
const logApiCall = (method, url, headers, body = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${method} ${url}`, { 
      headers: headers ? { ...headers } : 'No headers',
      body: body ? body : 'No body'
    });
  }
};

class QuestionService {
  // Create a new question
  createQuestion(questionData) {
    logApiCall('POST', API_URL, authHeader(), questionData);
    return axios.post(API_URL, questionData, { headers: authHeader() })
      .then(response => {
        console.log('Question created successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error creating question:', error.response?.data || error.message);
        throw error;
      });
  }

  // Update an existing question
  updateQuestion(questionId, questionData) {
    const url = `${API_URL}/${questionId}`;
    logApiCall('PUT', url, authHeader(), questionData);
    return axios.put(url, questionData, { headers: authHeader() })
      .then(response => {
        console.log('Question updated successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error updating question:', error.response?.data || error.message);
        throw error;
      });
  }

  // Delete a question
  deleteQuestion(questionId) {
    const url = `${API_URL}/${questionId}`;
    logApiCall('DELETE', url, authHeader());
    return axios.delete(url, { headers: authHeader() })
      .then(response => {
        console.log('Question deleted successfully');
        return response;
      })
      .catch(error => {
        console.error('Error deleting question:', error.response?.data || error.message);
        throw error;
      });
  }

  // Get question by ID
  getQuestionById(questionId) {
    const url = `${API_URL}/${questionId}`;
    logApiCall('GET', url, authHeader());
    return axios.get(url, { headers: authHeader() })
      .then(response => {
        console.log('Question fetched successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error fetching question:', error.response?.data || error.message);
        throw error;
      });
  }

  // Get questions by exam ID
  getQuestionsByExam(examId, page = 0, size = 10) {
    const url = `${API_URL}?examId=${examId}&page=${page}&size=${size}`;
    logApiCall('GET', url, authHeader());
    return axios.get(url, { headers: authHeader() })
      .then(response => {
        console.log('Questions fetched successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error fetching questions:', error.response?.data || error.message);
        throw error;
      });
  }

  // Import questions from CSV
  importQuestionsFromCsv(file, examId) {
    // Ensure we have a valid examId
    if (!examId) {
      console.error('Error: No examId provided for importing questions');
      return Promise.reject(new Error('No examId provided'));
    }
    
    // Fix the URL - remove the duplicate "questions" in the path
    const url = `${API_URL}/import?examId=${examId}`;
    console.log(`Importing questions CSV for exam ID: ${examId}`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = {
      ...authHeader(),
      // Let the browser set the content type for FormData
    };
    
    logApiCall('POST', url, headers, { 
      fileType: file.type, 
      fileName: file.name,
      fileSize: file.size,
      examId: examId 
    });
    
    return axios.post(url, formData, { headers })
      .then(response => {
        console.log('Questions imported successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error importing questions:', error.response?.data || error.message);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error details:', error.response.data);
        }
        throw error;
      });
  }
}

export default new QuestionService(); 