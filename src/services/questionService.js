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
    // Validate question data
    if (!questionData || !questionData.examId) {
      console.error('Invalid question data: Missing examId');
      return Promise.reject(new Error('Invalid question data: Missing required fields'));
    }
    
    // Ensure all required fields are present
    if (!questionData.title || !questionData.type) {
      console.error('Invalid question data: Missing title or type');
      return Promise.reject(new Error('Invalid question data: Missing required fields'));
    }
    
    // Type-specific validations
    if ((questionData.type === 'SINGLE_CHOICE' || questionData.type === 'MULTIPLE_CHOICE') && 
        (!questionData.choices || questionData.choices.length === 0)) {
      console.error('Invalid question data: Choices are required for choice-type questions');
      return Promise.reject(new Error('Please provide choices for multiple choice questions'));
    }
    
    // Get current user ID from local storage
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const userId = currentUser.id;
    
    if (!userId) {
      console.error('No user ID found for question creation');
      return Promise.reject(new Error('Authentication error: Please login again'));
    }
    
    // Ensure all fields match the backend CreateQuestionRequest model exactly
    const formattedData = {
      examId: typeof questionData.examId === 'string' ? parseInt(questionData.examId, 10) : questionData.examId,
      title: questionData.title.trim(),
      type: questionData.type,
      choices: questionData.choices || [],
      answer: questionData.answer || "",
      image: questionData.image || null,
      user_id: userId // The database field name is actually user_id not creatorId
    };
    
    // Validate the question type is valid
    if (!['ESSAY', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(formattedData.type)) {
      console.error('Invalid question type:', formattedData.type);
      return Promise.reject(new Error('Invalid question type. Must be ESSAY, SINGLE_CHOICE, or MULTIPLE_CHOICE.'));
    }
    
    // Log the request details
    console.log(`Creating question for exam ID: ${formattedData.examId} by user ID: ${formattedData.user_id}`);
    console.log('Question type:', formattedData.type);
    console.log('Question data:', JSON.stringify(formattedData, null, 2));
    
    logApiCall('POST', API_URL, authHeader(), formattedData);
    
    return axios.post(API_URL, formattedData, { 
      headers: authHeader(),
      timeout: 10000 // 10 second timeout
    })
      .then(response => {
        console.log('Question created successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error creating question:', error.response?.data || error.message);
        
        if (error.response) {
          // Log detailed error information
          console.error('Error status:', error.response.status);
          console.error('Error details:', error.response.data);
          
          // Check for database constraint errors
          if (error.response.status === 500 && 
              error.response.data?.message && 
              error.response.data.message.includes('Check constraint')) {
            console.error('DB constraint error detected:', error.response.data.message);
            const fields = error.response.data.message.match(/\(([^)]+)\)/);
            if (fields && fields[1]) {
              const missingFields = fields[1].split(',');
              console.error('Missing fields detected:', missingFields);
              throw new Error(`Database error: Missing or invalid fields (${missingFields.join(', ')}). Please check your form data.`);
            }
            
            // Look for enum constraint issues
            if (error.response.data.message.includes('enum')) {
              throw new Error('The question type must be one of: ESSAY, SINGLE_CHOICE, or MULTIPLE_CHOICE.');
            }
          }
          
          // Provide more specific error messages based on status codes
          if (error.response.status === 400) {
            throw new Error('Invalid question format. Please check all required fields.');
          } else if (error.response.status === 404) {
            throw new Error('Exam not found. Please refresh the page and try again.');
          } else if (error.response.status === 403) {
            throw new Error('You do not have permission to add questions to this exam.');
          } else if (error.response.status === 401) {
            throw new Error('Authentication error. Please login again.');
          } else if (error.response.status === 500) {
            throw new Error('Server error. Please try again later or contact support.');
          }
        } else if (error.request) {
          console.error('No response received from server');
          throw new Error('No response from server. Please check your connection and try again.');
        }
        
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
    // Validate exam ID
    if (!examId || examId === 0 || examId === '0') {
      console.error('Invalid exam ID for fetching questions:', examId);
      return Promise.reject(new Error('Invalid exam ID'));
    }
    
    const url = `${API_URL}?examId=${examId}&page=${page}&size=${size}`;
    console.log(`Fetching questions for exam ID: ${examId} (page: ${page}, size: ${size})`);
    
    logApiCall('GET', url, authHeader());
    
    return axios.get(url, { 
      headers: authHeader(),
      timeout: 10000 // 10 second timeout
    })
      .then(response => {
        // Check if response has data
        if (!response.data) {
          console.warn('Empty response data from questions API');
          return { data: { content: [] } };
        }
        
        // Log first question for debugging
        if (response.data.content && response.data.content.length > 0) {
          console.log('First question sample:', JSON.stringify(response.data.content[0], null, 2));
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          console.log('First question sample:', JSON.stringify(response.data[0], null, 2));
        }
        
        console.log(`Successfully fetched ${response.data.content?.length || 
          (Array.isArray(response.data) ? response.data.length : 0)} questions`);
        
        return response;
      })
      .catch(error => {
        console.error('Error fetching questions:', error.response?.data || error.message);
        
        if (error.response) {
          // Log detailed error information
          console.error('Error status:', error.response.status);
          console.error('Error details:', error.response.data);
          
          // Handle specific status codes
          if (error.response.status === 404) {
            console.warn('No questions found for exam ID:', examId);
            return { data: { content: [] } }; // Return empty list instead of error
          } else if (error.response.status === 403) {
            throw new Error('You do not have permission to view questions for this exam.');
          } else if (error.response.status === 401) {
            throw new Error('Authentication error. Please login again.');
          }
        } else if (error.request) {
          console.error('No response received from server');
          throw new Error('No response from server. Please check your connection and try again.');
        }
        
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
    
    // Fix the URL - correct path according to the backend controller
    const url = `${API_URL}/questions/import?examId=${examId}`;
    console.log(`Importing questions CSV for exam ID: ${examId}`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = {
      ...authHeader(),
      'Content-Type': 'multipart/form-data'
      // Let the browser set the content type for FormData
    };
    
    logApiCall('POST', url, headers, { 
      fileType: file.type, 
      fileName: file.name,
      fileSize: file.size,
      examId: examId 
    });
    
    return axios.post(url, formData, { 
      headers,
      timeout: 30000 // Increase timeout to 30 seconds for large files
    })
      .then(response => {
        console.log('Questions imported successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error importing questions:', error.response?.data || error.message);
        if (error.response) {
          console.error('Error status:', error.response.status);
          console.error('Error details:', error.response.data);
          
          // Provide more specific error messages based on status codes
          if (error.response.status === 400) {
            throw new Error('Invalid CSV format or data. Please check your file and try again.');
          } else if (error.response.status === 404) {
            throw new Error('Exam not found. Please refresh the page and try again.');
          } else if (error.response.status === 413) {
            throw new Error('File is too large. Please use a smaller file.');
          } else if (error.response.status === 500) {
            throw new Error('Server error. Please try again later or contact support.');
          }
        }
        throw error;
      });
  }

  // Get all questions in exam (without pagination)
  getAllQuestionsInExam(examId) {
    const url = `${API_URL}?examId=${examId}&page=0&size=1000`; // Use large size to get all questions
    logApiCall('GET', url, authHeader());
    
    return axios.get(url, { 
      headers: authHeader(),
      timeout: 10000
    })
      .then(response => {
        console.log('Questions fetched successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error fetching questions:', error.response?.data || error.message);
        throw error;
      });
  }

  // Get question statistics by answer
  getQuestionStatistics(questionId) {
    const url = `${API_URL}/statistics/${questionId}`;
    logApiCall('GET', url, authHeader());
    
    return axios.get(url, { 
      headers: authHeader(),
      timeout: 10000
    })
      .then(response => {
        console.log('Question statistics fetched successfully:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error fetching question statistics:', error.response?.data || error.message);
        throw error;
      });
  }
}

export default new QuestionService(); 