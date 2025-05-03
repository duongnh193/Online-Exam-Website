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
    const url = `${API_URL}?teacherId=${teacherId}&page=${page}&size=${size}&sort=${sort}`;
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
    // API endpoint to get the count of students in a class
    const url = `${API_URL}/${classId}/students/count`;
    const headers = authHeader();
    logApiCall('GET', url, headers);
    return axios.get(url, { 
      headers
    }).catch(error => {
      console.error(`Error fetching student count for class ${classId}:`, error);
      console.error(`Error details:`, error.response?.data || error.message);
      // Return a default value if the endpoint doesn't exist yet
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
}

export default new ClassService(); 