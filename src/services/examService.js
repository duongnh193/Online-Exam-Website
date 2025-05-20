import axios from 'axios';
import authHeader from './authHeader';

// API URL - ensure correct API path
const API_URL = 'http://localhost:8080/api/v1/exams';

// Helper for logging API calls in development
const logApiCall = (method, url, headers, body = null) => {
  console.log(`🔄 ${method} ${url}`, { 
    headers: headers ? { 
      Authorization: headers.Authorization ? `${headers.Authorization.substring(0, 15)}...` : 'None',
      'Content-Type': headers['Content-Type'] || 'Not set'
    } : 'No headers',
    body: body ? (typeof body === 'object' ? 'Object payload' : body) : 'No body'
  });
};

// Print current authentication state
const logAuthState = () => {
  const token = localStorage.getItem('token');
  console.log('Auth state check - Token exists:', !!token);
  if (token) {
    console.log('Token length:', token.length);
    console.log('Token prefix:', token.substring(0, 10) + '...');
  }
};

// Utility function to calculate exam status based on time
const calculateExamStatus = (exam) => {
  if (!exam || !exam.startAt || !exam.endAt) {
    return exam?.status || 'SCHEDULED';
  }

  const now = new Date();
  const startTime = new Date(exam.startAt);
  const endTime = new Date(exam.endAt);
  
  // If any timestamps are invalid, return the existing status
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    console.warn('Invalid timestamp detected for exam:', exam.id);
    return exam?.status || 'SCHEDULED';
  }

  // Calculate status based on time
  if (now < startTime) {
    return 'SCHEDULED';
  } else if (now <= endTime) {
    return 'ONGOING';
  } else {
    return 'COMPLETED';
  }
};

class ExamService {
  // Create a new exam
  createExam(examData) {
    logAuthState();
    const headers = authHeader();
    logApiCall('POST', API_URL, headers, examData);
    
    return axios.post(API_URL, examData, { 
      headers,
      timeout: 10000
    })
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
    logAuthState();
    const url = `${API_URL}/${examId}`;
    const headers = authHeader();
    logApiCall('PUT', url, headers, examData);
    
    return axios.put(url, examData, { 
      headers,
      timeout: 10000 
    })
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
    // Validate exam ID
    if (!examId || examId === 0) {
      console.error('deleteExam: Invalid exam ID provided:', examId);
      return Promise.reject(new Error('Invalid exam ID provided'));
    }
    
    logAuthState();
    const url = `${API_URL}/${examId}`;
    const headers = authHeader();
    
    console.log(`Attempting to delete exam with ID: ${examId}`);
    logApiCall('DELETE', url, headers);
    
    return axios.delete(url, { 
      headers,
      timeout: 10000 
    })
    .then(response => {
      console.log(`Exam ${examId} deleted successfully`);
      return response;
    })
    .catch(error => {
      console.error(`Error deleting exam ${examId}:`, error.response?.data || error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Details:', error.response.data);
      }
      throw error;
    });
  }

  // Get exam by ID
  getExamById(examId) {
    // Validate exam ID
    if (!examId || examId === 0 || examId === '0') {
      console.error('getExamById: Invalid exam ID provided:', examId);
      return Promise.reject(new Error('Invalid exam ID provided'));
    }

    logAuthState();
    const url = `${API_URL}/${examId}`;
    const headers = authHeader();
    
    console.log(`Fetching exam with ID: ${examId}`);
    logApiCall('GET', url, headers);
    
    return axios.get(url, { 
      headers,
      timeout: 10000
    })
    .then(response => {
      console.log('Exam fetched successfully:', response.data);
      
      // Validate and ensure response has required properties
      if (response.data) {
        // Make sure the exam object has all required properties
        const exam = response.data;
        
        // Calculate the correct status based on time
        const calculatedStatus = calculateExamStatus(exam);
        
        const processedExam = {
          ...exam,
          id: exam.id || 0,
          title: exam.title || 'Untitled Exam',
          classId: exam.classId || null,
          duration: exam.duration || 60,
          // Use the calculated status
          status: calculatedStatus,
          questions: exam.questions || []
        };
        
        return {
          ...response,
          data: processedExam
        };
      }
      
      return response;
    })
    .catch(error => {
      console.error('Error fetching exam:', error.response?.data || error.message);
      
      // Provide more detailed error logging
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error details:', error.response.data);
      }
      
      throw error;
    });
  }

  // Get exams by class ID
  getExamsByClass(classId, page = 0, size = 10, status = null) {
    // Validate classId - ensure it's a valid number
    if (!classId) {
      console.error('getExamsByClass: No classId provided');
      return Promise.reject(new Error('No classId provided'));
    }
    
    // Ensure classId is a number
    const numericClassId = Number(classId);
    if (isNaN(numericClassId)) {
      console.error(`getExamsByClass: Invalid classId format: ${classId}`);
      return Promise.reject(new Error('Invalid classId format'));
    }
    
    logAuthState();
    
    // Build URL with classId and pagination
    // Ensure query parameters are correctly formatted
    let url = `${API_URL}?classId=${numericClassId}&page=${page}&size=${size}`;
    
    // Add status filter if provided
    if (status) {
      url += `&status=${status}`;
    }
    
    const headers = authHeader();
    console.log(`Fetching exams for class ${numericClassId}`);
    console.log(`Full URL: ${url}`);
    console.log(`Headers:`, {
      Authorization: headers.Authorization ? 'Set' : 'Not set',
      'Content-Type': headers['Content-Type'] || 'Not set'
    });
    
    logApiCall('GET', url, headers);
    
    return axios.get(url, { 
      headers,
      timeout: 15000 // Increased timeout for potentially larger responses
    })
    .then(response => {
      console.log('Exams API raw response status:', response.status);
      
      // Transform data to ensure title is properly set
      let processedResponse = { ...response };
      let responseData = response.data;
      
      if (!responseData) {
        console.warn('Empty response data from API');
        return {
          ...response,
          data: { content: [] }
        };
      }
      
      console.log('Response data type:', typeof responseData);
      
      // Handle paginated response
      if (responseData && responseData.content) {
        const examCount = responseData.content.length;
        console.log(`Received ${examCount} exams (paginated)`);
        
        // Process each exam
        if (examCount > 0) {
          const processedContent = responseData.content.map(exam => {
            // Calculate the correct status based on time
            const calculatedStatus = calculateExamStatus(exam);
            
            return {
              ...exam,
              id: exam.id || 0,
              title: exam.title || `Exam #${exam.id || 0}`,
              // Use the calculated status instead of existing one
              status: calculatedStatus,
              questions: Array.isArray(exam.questions) ? exam.questions : []
            };
          });
          
          processedResponse.data = {
            ...responseData,
            content: processedContent
          };
        }
      } 
      // Handle array response
      else if (Array.isArray(responseData)) {
        const examCount = responseData.length;
        console.log(`Received ${examCount} exams (array)`);
        
        if (examCount > 0) {
          const processedArray = responseData.map(exam => {
            // Calculate the correct status based on time
            const calculatedStatus = calculateExamStatus(exam);
            
            return {
              ...exam,
              id: exam.id || 0,
              title: exam.title || `Exam #${exam.id || 0}`,
              // Use the calculated status
              status: calculatedStatus,
              questions: Array.isArray(exam.questions) ? exam.questions : []
            };
          });
          
          processedResponse.data = processedArray;
        }
      }
      // Handle single exam response
      else if (responseData && typeof responseData === 'object') {
        console.log('Received single exam object');
        
        // Calculate the correct status based on time
        const calculatedStatus = calculateExamStatus(responseData);
        
        const processedExam = {
          ...responseData,
          id: responseData.id || 0,
          title: responseData.title || `Exam #${responseData.id || 0}`,
          status: calculatedStatus,
          questions: Array.isArray(responseData.questions) ? responseData.questions : []
        };
        
        // Wrap in content array for consistency
        processedResponse.data = {
          content: [processedExam],
          totalElements: 1,
          totalPages: 1,
          size: 1,
          number: 0
        };
      }
      // Handle unexpected response
      else {
        console.warn('Unexpected response format, returning empty result');
        processedResponse.data = { content: [] };
      }
      
      return processedResponse;
    })
    .catch(error => {
      console.error('Error fetching exams:', error.message);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Details:', error.response.data);
      } else if (error.request) {
        console.error('No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // Return empty result on error to prevent UI crashes
      return {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: page,
          size: size,
          empty: true
        }
      };
    });
  }

  // Get question count for an exam
  getQuestionCount(examId) {
    // Validate exam ID
    if (!examId || examId === 0 || examId === '0') {
      console.error('getQuestionCount: Invalid exam ID provided:', examId);
      return Promise.resolve(0); // Return 0 for invalid IDs
    }

    const url = `http://localhost:8080/api/v1/questions?examId=${examId}&page=0&size=1`;
    const headers = authHeader();
    
    console.log(`Fetching question count for exam ID: ${examId}`);
    logApiCall('GET', url, headers);
    
    return axios.get(url, { 
      headers,
      timeout: 5000 // Quick timeout as we only need the count
    })
    .then(response => {
      // If we get a paginated response, we can get the total count
      if (response.data && response.data.totalElements !== undefined) {
        console.log(`Found ${response.data.totalElements} questions for exam ${examId}`);
        return response.data.totalElements;
      }
      
      // If we get an array response, return its length
      if (Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} questions for exam ${examId}`);
        return response.data.length;
      }
      
      // If response has content array, return its length
      if (response.data && Array.isArray(response.data.content)) {
        console.log(`Found ${response.data.content.length} questions for exam ${examId}`);
        return response.data.totalElements || response.data.content.length;
      }
      
      // Fallback
      return 0;
    })
    .catch(error => {
      console.error(`Error fetching question count for exam ${examId}:`, error.message);
      // Return 0 on error instead of throwing
      return 0;
    });
  }

  // Get exam password by ID
  getExamPassword(examId) {
    // Validate exam ID
    if (!examId || examId === 0 || examId === '0') {
      console.error('getExamPassword: Invalid exam ID provided:', examId);
      return Promise.reject(new Error('Invalid exam ID provided'));
    }

    logAuthState();
    const url = `${API_URL}/password/${examId}`;
    const headers = authHeader();
    
    console.log(`Fetching password for exam ID: ${examId}`);
    logApiCall('GET', url, headers);
    
    return axios.get(url, { 
      headers,
      timeout: 5000
    })
    .then(response => {
      console.log('Password fetched successfully');
      return response.data.password;
    })
    .catch(error => {
      console.error('Error fetching exam password:', error.response?.data || error.message);
      throw error;
    });
  }
}

export default new ExamService(); 