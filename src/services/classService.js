import axios from 'axios';
import authHeader from './authHeader';

// Use environment variable or fall back to default - matching pattern from other services
const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/v1/classes` : 'http://localhost:8080/api/v1/classes';
console.log('🌐 ClassService API_URL:', API_URL);
console.log('🌐 Environment variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// Helper function to log API requests
const logApiCall = (method, url, headers, data = null) => {
  console.log(`🔍 ClassService API Call: ${method} ${url}`);
  console.log('🔑 Headers:', headers);
  if (data) {
    console.log('📦 Request Data:', data);
  }
};

class ClassService {
  // Get all classes (admin)
  getAllClasses(page = 0, size = 10, sort = 'id,asc') {
    const url = `${API_URL}/all?page=${page}&size=${size}&sort=${sort}`;
    const headers = authHeader();
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }

  // Get classes by teacher ID
  getClassesByTeacher(teacherId, page = 0, size = 10, sort = 'id,asc') {
    const url = `${API_URL}/by-teacher?teacherId=${teacherId}&page=${page}&size=${size}&sort=${sort}`;
    const headers = authHeader();
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }

  // Get class by ID
  getClassById(id) {
    const url = `${API_URL}/${id}`;
    const headers = authHeader();
    logApiCall('GET', url, headers);
    return axios.get(url, { headers });
  }

  // Create a new class
  createClass(classData) {
    const headers = authHeader();
    logApiCall('POST', API_URL, headers, classData);
    return axios.post(API_URL, classData, { headers });
  }

  // Update a class
  updateClass(id, classData) {
    const url = `${API_URL}/${id}`;
    const headers = authHeader();
    logApiCall('PUT', url, headers, classData);
    return axios.put(url, classData, { headers });
  }

  // Delete a class
  deleteClass(id) {
    const url = `${API_URL}/${id}`;
    const headers = authHeader();
    logApiCall('DELETE', url, headers);
    return axios.delete(url, { headers });
  }
  
  // Get student count for a class
  getStudentCountForClass(classId) {
    // API endpoint to get students in a class with minimal page size
    // We only need the total count, not the actual students
    const url = `${API_URL}/${classId}/students?page=0&size=1`;
    const headers = authHeader();
    logApiCall('GET', url, headers);
    
    return axios.get(url, { 
      headers,
      timeout: 5000 // 5 second timeout
    })
    .then(response => {
      console.log(`Successfully retrieved student count for class ${classId}`);
      
      // If it's a paginated response, return the total elements count
      if (response.data && response.data.totalElements !== undefined) {
        console.log(`Student count for class ${classId}: ${response.data.totalElements}`);
        return { data: response.data.totalElements };
      }
      
      // If it's just an array, return its length
      if (Array.isArray(response.data)) {
        console.log(`Student count for class ${classId}: ${response.data.length}`);
        return { data: response.data.length };
      }
      
      // Default fallback
      console.warn(`Unexpected response format for student count, returning 0`);
      return { data: 0 };
    })
    .catch(error => {
      console.error(`Error fetching student count for class ${classId}:`, error);
      if (error.response) {
        console.error(`Error status: ${error.response.status}, message: ${error.response.data || 'Unknown error'}`);
      } else {
        console.error(`Error message: ${error.message || 'Unknown error'}`);
      }
      // Return a default value if there's an error
      return { data: 0 };
    });
  }
  
  // Import students from CSV file
  importStudentsFromCsv(classId, file) {
    const url = `${API_URL}/${classId}/import`;
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = {
      ...authHeader(),
      'Content-Type': 'multipart/form-data'
    };
    logApiCall('POST', url, headers, { fileType: file.type, fileName: file.name });
    
    return axios.post(url, formData, { headers });
  }
  
  // Add student to class by username or email
  addStudentToClass(classId, usernameOrEmail) {
    const url = `${API_URL}/${classId}/add-student?usernameOrEmail=${usernameOrEmail}`;
    const headers = authHeader();
    logApiCall('POST', url, headers);
    return axios.post(url, {}, { headers });
  }
  
  // Remove student from class
  removeStudentFromClass(classId, usernameOrEmail) {
    const url = `${API_URL}/${classId}/remove-student?usernameOrEmail=${usernameOrEmail}`;
    const headers = authHeader();
    logApiCall('DELETE', url, headers);
    return axios.delete(url, { headers });
  }
  
  // Get students in a class
  getStudentsInClass(classId, page = 0, size = 10) {
    const url = `${API_URL}/${classId}/students?page=${page}&size=${size}`;
    const headers = authHeader();
    logApiCall('GET', url, headers);
    
    return axios.get(url, { headers })
      .then(response => {
        console.log(`Successfully retrieved students for class ${classId}:`, response.data);
        return response;
      })
      .catch(error => {
        console.error(`Error fetching students for class ${classId}:`, error);
        console.error(`Error details:`, error.response?.data || error.message);
        throw error;
      });
  }

  // Get classes for a student
  getStudentClasses(studentId, page = 0, size = 10) {
    if (!studentId) {
      console.error('getStudentClasses: No studentId provided');
      return Promise.reject(new Error('No studentId provided'));
    }
    
    const url = `${API_URL}/by-student?studentId=${studentId}&page=${page}&size=${size}`;
    const headers = authHeader();
    
    console.log(`Fetching classes for student ${studentId} with URL: ${url}`);
    console.log('Auth header present:', !!headers.Authorization);
    logApiCall('GET', url, headers);
    
    return axios.get(url, { 
      headers,
      timeout: 10000 // 10 second timeout
    })
    .then(response => {
      console.log('Student classes raw API response:', response);
      console.log('Student classes fetched successfully:', response.data);
      
      // Add detailed logging to debug the response
      if (response.data && response.data.content) {
        console.log(`Received ${response.data.content.length} classes (paginated)`);
        if (response.data.content.length > 0) {
          console.log('First class in response:', response.data.content[0]);
        }
      } else if (Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} classes (array)`);
        if (response.data.length > 0) {
          console.log('First class in response:', response.data[0]);
        }
      } else {
        console.warn('Unexpected response format for student classes:', response.data);
      }
      
      return response;
    })
    .catch(error => {
      console.error('Error fetching student classes:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
        
        // Specific error handling based on status codes
        if (error.response.status === 404) {
          console.log('No classes found for this student (404)');
          // Return an empty response instead of throwing
          return { data: { content: [] } };
        } else if (error.response.status === 401) {
          console.error('Authentication error when fetching student classes');
        } else if (error.response.status === 403) {
          console.error('Permission denied when fetching student classes');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      
      throw error;
    });
  }
}

export default new ClassService(); 