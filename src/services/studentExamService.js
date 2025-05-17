import axios from 'axios';
import authHeader from './authHeader';

// API URL for student exam operations
const API_URL = 'http://localhost:8080/api/v1/student-exams';

// Helper for logging API calls
const logApiCall = (method, url, headers, body = null) => {
  console.log(`🔄 ${method} ${url}`, { 
    headers: headers ? { 
      Authorization: headers.Authorization ? `${headers.Authorization.substring(0, 15)}...` : 'None',
      'Content-Type': headers['Content-Type'] || 'Not set'
    } : 'No headers',
    body: body ? 'Request payload' : 'No body'
  });
};

class StudentExamService {
  // Start an exam with password
  startExam(examId, password) {
    if (!examId) {
      console.error('startExam: Missing examId');
      return Promise.reject(new Error('Missing exam ID'));
    }

    if (!password) {
      console.error('startExam: Missing password');
      return Promise.reject(new Error('Missing password'));
    }

    const headers = authHeader();
    
    // Special case for checking if an exam exists without starting it
    // When used with checkExamInProgress, this param signals we just want to check if already started
    const isCheckOnly = password === 'checkonly';
    
    // If checking only, use a password that will definitely fail but allow detecting "already started" errors
    const url = `${API_URL}/start?examId=${examId}&password=${encodeURIComponent(isCheckOnly ? 'status_check_only' : password)}`;
    
    console.log(`Attempting to ${isCheckOnly ? 'check' : 'start'} exam ${examId}`);
    logApiCall('POST', url, headers);
    
    return axios.post(url, {}, {
      headers,
      timeout: 10000
    })
    .then(response => {
      // If this was just a check and we get here, the exam doesn't exist yet
      if (isCheckOnly) {
        console.log('Exam status check: exam has not been started yet');
        return { alreadyStarted: false };
      }
      
      console.log('Exam started successfully:', response.status);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Log the studentExam ID directly for debugging
      if (response.data && response.data.studentExam && response.data.studentExam.id) {
        console.log('Student Exam ID:', response.data.studentExam.id);
        console.log('First question:', response.data.nextQuestion);
        console.log('Is last question:', response.data.lastQuestion);
      } else {
        console.warn('No studentExam or ID found in response data');
      }
      
      return response;
    })
    .catch(error => {
      console.error('Error starting exam:', error.response?.data || error.message);
      
      // Handle specific errors
      if (error.response) {
        // Specifically detect the "Exam already started" error
        if (error.response.status === 400 || error.response.status === 500) {
          const errorMessage = error.response.data?.message || '';
          
          if (errorMessage.includes('Exam already started')) {
            const alreadyStartedError = new Error('You have already started this exam. Please continue your existing session.');
            alreadyStartedError.alreadyStarted = true;
            throw alreadyStartedError;
          } else if (errorMessage) {
            throw new Error(errorMessage);
          }
        }
      }
      
      throw error;
    });
  }

  // Submit answer for a question
  submitAnswer(studentExamId, questionId, answer) {
    if (!studentExamId || !questionId) {
      console.error('submitAnswer: Missing required parameters');
      return Promise.reject(new Error('Missing required parameters'));
    }

    // Check for possible duplicate submission
    const submissionKey = `${studentExamId}_${questionId}`;
    const lastSubmission = localStorage.getItem(`last_submission_${submissionKey}`);
    
    // If we submitted this same question in the last 2 seconds, prevent duplicate submission
    if (lastSubmission) {
      const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission, 10);
      if (timeSinceLastSubmission < 2000) { // 2 seconds
        console.warn('Preventing duplicate submission of the same question');
        return Promise.reject(new Error('Please wait before submitting again'));
      }
    }
    
    // Mark this question as being submitted
    localStorage.setItem(`last_submission_${submissionKey}`, Date.now().toString());

    const headers = {
      ...authHeader(),
      'Content-Type': 'application/json'
    };
    
    const data = {
      studentExamId,
      questionId,
      answer
    };
    
    console.log(`Submitting answer for question ${questionId} in exam ${studentExamId}`);
    logApiCall('POST', `${API_URL}/submit-answer`, headers, data);
    
    return axios.post(`${API_URL}/submit-answer`, data, {
      headers,
      timeout: 5000
    })
    .then(response => {
      // Update the last question flag in local storage if this is the last question
      if (response.data && response.data.lastQuestion) {
        localStorage.setItem(`last_question_${studentExamId}`, 'true');
      }
      return response;
    })
    .catch(error => {
      console.error('Error submitting answer:', error);
      // Remove the submission timestamp to allow retry
      localStorage.removeItem(`last_submission_${submissionKey}`);
      throw error;
    });
  }

  // Submit entire exam
  submitExam(studentExamId) {
    if (!studentExamId) {
      console.error('submitExam: Missing studentExamId');
      return Promise.reject(new Error('Missing student exam ID'));
    }

    const headers = authHeader();
    const url = `${API_URL}/submit?studentExamId=${encodeURIComponent(studentExamId)}`;
    
    console.log(`Submitting exam ${studentExamId}`);
    logApiCall('POST', url, headers);
    
    return axios.post(url, {}, {
      headers,
      timeout: 10000
    })
    .then(response => {
      console.log('Exam submitted successfully:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Failed to submit exam:', error.response?.status || error.message);
      throw error;
    });
  }

  // Get student exam result by ID
  getStudentExamResult(studentExamId) {
    if (!studentExamId) {
      console.error('getStudentExamResult: Missing studentExamId');
      return Promise.reject(new Error('Missing student exam ID'));
    }

    const headers = authHeader();
    const url = `${API_URL}/${studentExamId}`;
    
    console.log(`Fetching exam result for ${studentExamId}`);
    logApiCall('GET', url, headers);
    
    return axios.get(url, {
      headers,
      timeout: 5000
    })
    .then(response => {
      console.log('Exam result fetched:', response.status);
      return response;
    })
    .catch(error => {
      console.error('Failed to fetch exam result:', error.response?.status || error.message);
      throw error;
    });
  }

  // Check if student has already completed this exam
  checkExamStatus(examId) {
    if (!examId) {
      console.error('checkExamStatus: Missing examId');
      return Promise.reject(new Error('Missing exam ID'));
    }

    // This would be better if the backend had a dedicated endpoint to check status
    // For now, we'll use local storage first, then try to check with the backend
    try {
      // Try local storage first as it's faster
      const completedExams = JSON.parse(localStorage.getItem('completedExams') || '{}');
      if (completedExams[examId]) {
        return Promise.resolve({ data: { status: 'COMPLETED', fromCache: true } });
      }
    } catch (e) {
      console.error('Error checking local storage:', e);
    }
    
    // Fall back to checking if there's an active session
    // We're returning a fake response as this endpoint doesn't exist
    return Promise.resolve({ data: { status: 'UNKNOWN' } });
  }

  // Check if student has an in-progress exam - returns studentExamId if found
  // This is a new method to check if an exam is in progress but not submitted
  checkExamInProgress(userId, examId) {
    if (!userId || !examId) {
      console.error('checkExamInProgress: Missing userId or examId');
      return Promise.reject(new Error('Missing user ID or exam ID'));
    }
    
    // Create the studentExamId using the same format as backend (userId-examId)
    const studentExamId = `${userId}-${examId}`;
    const headers = authHeader();
    
    // First, let's try to check if the exam already exists by attempting to start it
    // When an exam already exists, the backend will return "Exam already started" error
    return this.startExam(examId, "checkonly")
      .then(() => {
        // If we get here, the exam hasn't been started yet
        return { inProgress: false, notStarted: true };
      })
      .catch(error => {
        // If we get "Exam already started" error, it means the exam is in progress
        if (error.message && error.message.includes('already started')) {
          console.log(`Exam ${examId} is already in progress for user ${userId}`);
          
          // Next, get the status of the exam to see if it's in progress or completed
          return axios.get(`${API_URL}/${studentExamId}`, {
            headers,
            timeout: 5000
          })
          .then(response => {
            console.log('Exam status response:', response.data);
            
            // Check the status of the returned exam
            const status = response.data?.status || 
                          (response.data?.studentExam && response.data.studentExam.status) || 
                          'UNKNOWN';
            
            // Check if the exam is already completed to prevent retaking
            if (['COMPLETED', 'SUBMITTED', 'FINISHED', 'GRADED'].includes(status.toUpperCase())) {
              return {
                completed: true,
                examSessionId: studentExamId,
                status: status
              };
            }
            
            // The exam is in progress and can be continued
            return {
              inProgress: true,
              examSessionId: studentExamId,
              status: status || 'IN_PROGRESS'
            };
          })
          .catch(fetchError => {
            console.warn('Error fetching exam status after detecting it exists:', fetchError);
            // Even if we can't get the status, we know the exam exists
            return {
              inProgress: true,
              examSessionId: studentExamId,
              status: 'IN_PROGRESS',
              error: true,
              errorMessage: fetchError.message
            };
          });
        }
        
        // For other errors, assume the exam hasn't been started
        console.log('Exam not started or error checking status:', error.message);
        return { inProgress: false, notFound: true };
      });
  }
}

export default new StudentExamService(); 