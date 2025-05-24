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
    
    // For debugging
    console.log(`startExam called with examId=${examId}, password=${password === 'checkonly' ? 'checkonly' : 'provided'}`);
    
    // Trực tiếp gửi mật khẩu đến API, đã loại bỏ phần status_check_only
    const url = `${API_URL}/start?examId=${examId}&password=${encodeURIComponent(password)}`;
    
    console.log(`Attempting to start exam ${examId}`);
    logApiCall('POST', url, headers);
    
    return axios.post(url, {}, {
      headers,
      timeout: 15000  // Increased timeout to allow more time for server processing
    })
    .then(response => {
      console.log('Exam started successfully:', response.status);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Handle time remaining data
      let timeRemainingSeconds = null;
      if (response.data.secondRemaining !== undefined && response.data.secondRemaining !== null) {
        timeRemainingSeconds = response.data.secondRemaining;
        console.log(`Time remaining from server: ${timeRemainingSeconds} seconds`);
      }
      
      // Store session information  
      if (response.data && response.data.studentExam && response.data.studentExam.id) {
        console.log('Student Exam ID:', response.data.studentExam.id);
        console.log('First question:', response.data.nextQuestion);
        console.log('Is last question:', response.data.lastQuestion);
        console.log('Current question index:', response.data.studentExam.currentQuestion);
        console.log('Time remaining (seconds):', timeRemainingSeconds);
        
        const examSessionData = {
          studentExamId: response.data.studentExam.id,
          examId: examId,
          timeRemaining: timeRemainingSeconds,
          startTime: Date.now()
        };
        localStorage.setItem('examSession', JSON.stringify(examSessionData));
        localStorage.setItem('currentStudentExamId', response.data.studentExam.id);
        
        // Also save current question index if available
        if (response.data.studentExam.currentQuestion !== undefined && response.data.studentExam.currentQuestion !== null) {
          localStorage.setItem(`exam_current_question_${response.data.studentExam.id}`, 
            response.data.studentExam.currentQuestion);
        }
        
        // If we have time remaining info, save it for resuming
        if (timeRemainingSeconds !== null) {
          localStorage.setItem(`exam_time_remaining_${response.data.studentExam.id}`, 
            timeRemainingSeconds.toString());
          localStorage.setItem(`exam_time_last_updated_${response.data.studentExam.id}`, 
            Date.now().toString());
        }
        
        // Store finishAtEstimate if available
        if (response.data.studentExam.finishAtEstimate) {
          localStorage.setItem(`exam_finish_time_${response.data.studentExam.id}`, 
            response.data.studentExam.finishAtEstimate);
        }
      } else {
        console.warn('No studentExam or ID found in response data');
      }
      
      // Store session information about time and exam progress
      if (examId && response.data?.studentExam?.id) {
        const studentExamId = response.data.studentExam.id;
        
        // Save current question index and time data for resuming
        if (response.data.studentExam.currentQuestion !== undefined && 
            response.data.studentExam.currentQuestion !== null) {
          localStorage.setItem(`exam_current_question_${studentExamId}`, 
            response.data.studentExam.currentQuestion);
        }
        
        // If we have time remaining info, save it for resuming
        if (timeRemainingSeconds !== null) {
          localStorage.setItem(`exam_time_remaining_${studentExamId}`, 
            timeRemainingSeconds.toString());
          localStorage.setItem(`exam_time_last_updated_${studentExamId}`, 
            Date.now().toString());
        }
      }
      
      return response;
    })
    .catch(error => {
      console.error('Error starting exam:', error.response?.data || error.message);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Error details:', error.response.data);
      }
      
      // Handle specific errors
      if (error.response) {
        // Specifically detect the "Exam already started" error
        if (error.response.status === 400 || error.response.status === 500) {
          const errorMessage = error.response.data?.message || '';
          
          if (errorMessage.includes('Exam already started')) {
            const alreadyStartedError = new Error('You have already started this exam. Please continue your existing session.');
            alreadyStartedError.alreadyStarted = true;
            throw alreadyStartedError;
          } else if (errorMessage.includes("Time's up") || errorMessage.includes("already completed")) {
            const completedError = new Error("Time's up! This exam has already been completed.");
            completedError.completed = true;
            throw completedError;
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

    // Check if the exam is being submitted
    if (localStorage.getItem(`exam_submitting_${studentExamId}`) === 'true') {
      console.log('Exam is being submitted - skipping individual answer submission');
      return Promise.reject(new Error('Exam is being submitted'));
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
    
    // Xử lý định dạng câu trả lời trước khi gửi
    console.log(`ANSWER FORMAT CHECK - Type: ${typeof answer}, Value: ${answer}`);
    
    // Lưu lại câu trả lời vào localStorage để debug và khôi phục nếu cần
    try {
      localStorage.setItem(`answer_${studentExamId}_q${questionId}`, answer);
    } catch (e) {
      console.warn('Could not save answer to localStorage:', e);
    }
    
    // Kiểm tra các loại câu trả lời
    if (typeof answer === 'string' && answer.includes(',')) {
      console.log(`Multiple choice detected: ${answer}`);
      try {
        // Lưu lại các giá trị multiple choice để debug
        const selections = answer.split(',');
        console.log('Selections array:', selections);
        
        // Làm sạch dữ liệu nếu cần
        if (selections.some(s => !s.trim())) {
          // Xóa các giá trị trống
          const cleanSelections = selections.filter(s => s.trim());
          console.log('Cleaned selections:', cleanSelections);
          
          // Cập nhật câu trả lời với giá trị đã làm sạch
          answer = cleanSelections.join(',');
          console.log('Updated answer value:', answer);
        }
      } catch (e) {
        console.error('Error processing multiple choice selections:', e);
      }
    }
    
    // Cấu trúc dữ liệu để gửi đi
    const data = {
      studentExamId,
      questionId,
      answer
    };
    
    // Lưu lại cấu trúc dữ liệu đã gửi để debug nếu cần
    try {
      localStorage.setItem(`answer_payload_${studentExamId}_q${questionId}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save answer payload to localStorage:', e);
    }
    
    console.log(`Submitting answer for question ${questionId} in exam ${studentExamId}`);
    console.log('Answer payload:', data);
    logApiCall('POST', `${API_URL}/submit-answer`, headers, data);
    
    return axios.post(`${API_URL}/submit-answer`, data, {
      headers,
      timeout: 5000
    })
    .then(response => {
      // Log chi tiết phản hồi để debug
      console.log(`Submit answer response for question ${questionId}:`, response.data);
      
      // Update the last question flag in local storage if this is the last question
      if (response.data && response.data.lastQuestion) {
        localStorage.setItem(`last_question_${studentExamId}`, 'true');
        console.log(`Marked question ${questionId} as last question in localStorage`);
      }
      
      return response;
    })
    .catch(error => {
      console.error('Error submitting answer:', error);
      // Lấy thông tin lỗi chi tiết
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
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
    
    // Mark this exam as being submitted to prevent duplicate answer submissions
    localStorage.setItem(`exam_submitting_${studentExamId}`, 'true');
    
    console.log(`Submitting exam ${studentExamId}`);
    logApiCall('POST', url, headers);
    
    return axios.post(url, {}, {
      headers,
      timeout: 15000 // Tăng timeout lên để đảm bảo đủ thời gian xử lý
    })
    .then(response => {
      console.log('Exam submitted successfully:', response.data);
      
      // Log chi tiết hơn để debug
      console.log('----- SUBMIT EXAM RESPONSE DETAILS -----');
      
      // Kiểm tra cấu trúc phản hồi
      if (!response.data) {
        console.error('Response data is empty');
        throw new Error('Response data is empty');
      }

      // Kiểm tra và xử lý dữ liệu phản hồi
      const processedResponse = {
        ...response.data
      };
      
      // Kiểm tra và chuẩn hóa các trường dữ liệu
      if (processedResponse.correctAnswers === undefined) {
        // Nếu không có các trường này, thử tìm ở nơi khác trong cấu trúc phản hồi
        if (processedResponse.result) {
          processedResponse.correctAnswers = processedResponse.result.correctAnswers;
          processedResponse.wrongAnswers = processedResponse.result.wrongAnswers;
          processedResponse.totalQuestions = processedResponse.result.totalQuestions;
          processedResponse.score = processedResponse.result.score;
        } else {
          // Đếm số câu trả lời đúng/sai nếu có danh sách câu trả lời chi tiết
          if (processedResponse.answerResults && Array.isArray(processedResponse.answerResults)) {
            const correctCount = processedResponse.answerResults.filter(a => a.correct).length;
            const totalCount = processedResponse.answerResults.length;
            
            processedResponse.correctAnswers = correctCount;
            processedResponse.wrongAnswers = totalCount - correctCount;
            processedResponse.totalQuestions = totalCount;
            processedResponse.score = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
          }
        }
      }
      
      // Xử lý chi tiết câu trả lời nếu có
      if (processedResponse.answerResults === undefined) {
        // Thử tìm ở các vị trí khác
        if (processedResponse.answers && Array.isArray(processedResponse.answers)) {
          processedResponse.answerResults = processedResponse.answers.map(answer => ({
            questionId: answer.questionId,
            questionText: answer.question?.title || answer.questionText || `Câu hỏi ${answer.questionId}`,
            studentAnswer: answer.studentAnswer || answer.answer || 'Không có',
            correctAnswer: answer.correctAnswer || answer.answer || 'Không có',
            correct: answer.correct || false
          }));
        } else if (processedResponse.questions && Array.isArray(processedResponse.questions)) {
          // Nếu có danh sách câu hỏi, kết hợp với danh sách câu trả lời
          const answersMap = {};
          if (processedResponse.answers && Array.isArray(processedResponse.answers)) {
            processedResponse.answers.forEach(answer => {
              answersMap[answer.questionId] = answer;
            });
          }
          
          processedResponse.answerResults = processedResponse.questions.map(question => {
            const answer = answersMap[question.id] || {};
            return {
              questionId: question.id,
              questionText: question.title || `Câu hỏi ${question.id}`,
              studentAnswer: answer.studentAnswer || answer.answer || 'Không có',
              correctAnswer: question.correctAnswer || answer.correctAnswer || 'Không có',
              correct: answer.correct || false
            };
          });
        }
      }
      
      try {
        // Lưu lại cấu trúc dữ liệu để có thể debug
        localStorage.setItem('last_exam_result', JSON.stringify(processedResponse));
        
        // Kiểm tra các trường kết quả quan trọng
        console.log('Processed response structure:', Object.keys(processedResponse));
        
        // Kiểm tra và log số lượng đúng/sai
        if (processedResponse.correctAnswers !== undefined) {
          console.log(`Correct answers: ${processedResponse.correctAnswers}`);
          console.log(`Wrong answers: ${processedResponse.wrongAnswers}`);
          console.log(`Total questions: ${processedResponse.totalQuestions}`);
          console.log(`Score: ${processedResponse.score}%`);
        }
        
        // Kiểm tra các câu trả lời chi tiết
        if (processedResponse.answerResults) {
          console.log('ANSWER RESULTS:');
          processedResponse.answerResults.forEach((result, index) => {
            console.log(`Question ${index + 1}:`);
            console.log(`  ID: ${result.questionId}`);
            console.log(`  Your answer: ${result.studentAnswer}`);
            console.log(`  Correct answer: ${result.correctAnswer}`);
            console.log(`  Is correct: ${result.correct}`);
          });
        }
        
        // Lấy ra tất cả câu trả lời đã lưu trong localStorage để so sánh
        try {
          const answerKeys = Object.keys(localStorage).filter(key => key.startsWith(`answer_${studentExamId}`));
          if (answerKeys.length > 0) {
            console.log('Locally stored answers:');
            answerKeys.forEach(key => {
              console.log(`  ${key}: ${localStorage.getItem(key)}`);
            });
          }
        } catch (e) {
          console.warn('Error checking localStorage for answers:', e);
        }
        
      } catch (e) {
        console.error('Error logging exam results:', e);
      }
      
      // Trả về dữ liệu đã xử lý
      return {
        ...response,
        data: processedResponse
      };
    })
    .catch(error => {
      console.error('Failed to submit exam:', error.response?.status || error.message);
      
      // Remove the submitting flag on error
      localStorage.removeItem(`exam_submitting_${studentExamId}`);
      
      // Log thêm chi tiết lỗi
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      }
      
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

  // Phương thức mới để lấy câu hỏi hiện tại
  getCurrentQuestion(studentExamId) {
    if (!studentExamId) {
      console.error('getCurrentQuestion: Missing studentExamId');
      return Promise.reject(new Error('Missing student exam ID'));
    }

    console.log(`Getting current question for exam ${studentExamId}`);
    
    // Dùng submitAnswer với questionId = 0 và answer rỗng để lấy câu hỏi hiện tại
    // Đây là hack để không ảnh hưởng đến trạng thái bài thi
    return this.submitAnswer(studentExamId, 0, "")
      .then(response => {
        console.log('Current question response:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Error getting current question:', error);
        
        // Nếu lỗi, thử phương pháp khác bằng cách lấy kết quả
        return this.getStudentExamResult(studentExamId)
          .then(result => {
            console.log('Got student exam result instead:', result.data);
            
            // Tạo câu trả lời giả để interface hoạt động đúng
            return {
              data: {
                studentExam: result.data.studentExam || result.data,
                nextQuestion: null,
                lastQuestion: true
              }
            };
          })
          .catch(secondError => {
            console.error('Both methods to get current question failed:', secondError);
            throw new Error('Failed to retrieve current question state');
          });
      });
  }
}

export default new StudentExamService(); 