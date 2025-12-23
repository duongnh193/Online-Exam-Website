import IStudentExamRepository from '../../domain/repositories/IStudentExamRepository';
import axiosClient from '../../infrastructure/http/axiosClient';
import localStorage from '../../infrastructure/storage/localStorage';

/**
 * Student Exam Repository Implementation
 */
class StudentExamRepository extends IStudentExamRepository {
  constructor() {
    super();
    this.API_URL = '/v1/student-exams';
  }

  async startExam(examId, password) {
    if (!examId) {
      throw new Error('Missing exam ID');
    }

    if (!password) {
      throw new Error('Missing password');
    }

    const url = `${this.API_URL}/start?examId=${examId}&password=${encodeURIComponent(password)}`;
    
    try {
      const response = await axiosClient.post(url, {}, {
        timeout: 15000
      });
      
      // Store session information
      if (response.data?.studentExam?.id) {
        const examSessionData = {
          studentExamId: response.data.studentExam.id,
          examId: examId,
          timeRemaining: response.data.secondsRemaining,
          startTime: Date.now()
        };
        localStorage.set('examSession', examSessionData);
        localStorage.setString('currentStudentExamId', response.data.studentExam.id);
        
        if (response.data.studentExam.currentQuestion !== undefined) {
          localStorage.setString(`exam_current_question_${response.data.studentExam.id}`, 
            response.data.studentExam.currentQuestion.toString());
        }
        
        if (response.data.secondsRemaining !== null) {
          localStorage.setString(`exam_time_remaining_${response.data.studentExam.id}`, 
            response.data.secondsRemaining.toString());
          localStorage.setString(`exam_time_last_updated_${response.data.studentExam.id}`, 
            Date.now().toString());
        }
        
        if (response.data.studentExam.finishAtEstimate) {
          localStorage.setString(`exam_finish_time_${response.data.studentExam.id}`, 
            response.data.studentExam.finishAtEstimate);
        }
      }
      
      return response;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400 || status === 500) {
          const errorMessage = data?.message || '';
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
    }
  }

  async submitAnswer(studentExamId, questionId, answer, currentQuestionIndex = null) {
    if (!studentExamId || !questionId) {
      throw new Error('Missing required parameters');
    }

    // Check if exam is being submitted
    if (localStorage.getString(`exam_submitting_${studentExamId}`) === 'true') {
      throw new Error('Exam is being submitted');
    }

    // Prevent duplicate submission
    const submissionKey = `${studentExamId}_${questionId}`;
    const lastSubmission = localStorage.getString(`last_submission_${submissionKey}`);
    
    if (lastSubmission) {
      const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission, 10);
      if (timeSinceLastSubmission < 2000) {
        throw new Error('Please wait before submitting again');
      }
    }
    
    localStorage.setString(`last_submission_${submissionKey}`, Date.now().toString());

    // Process answer format
    if (typeof answer === 'string' && answer.includes(',')) {
      const selections = answer.split(',').filter(s => s.trim());
      answer = selections.join(',');
    }
    
    const data = {
      studentExamId,
      questionId,
      answer,
      currentQuestionIndex
    };
    
    try {
      localStorage.setString(`answer_${studentExamId}_q${questionId}`, answer);
    } catch (e) {
      console.warn('Could not save answer to localStorage:', e);
    }
    
    try {
      const response = await axiosClient.post(`${this.API_URL}/submit-answer`, data, {
        timeout: 5000
      });
      
      if (response.data?.lastQuestion) {
        localStorage.setString(`last_question_${studentExamId}`, 'true');
      }
      
      return response;
    } catch (error) {
      localStorage.remove(`last_submission_${submissionKey}`);
      throw error;
    }
  }

  async getQuestion(studentExamId, questionIndex) {
    if (!studentExamId) {
      throw new Error('Missing student exam ID');
    }

    if (typeof questionIndex !== 'number') {
      throw new Error('Missing question index');
    }

    const url = `${this.API_URL}/${encodeURIComponent(studentExamId)}/questions/${questionIndex}`;
    return axiosClient.get(url, {
      timeout: 5000
    });
  }

  async submitExam(studentExamId) {
    if (!studentExamId) {
      throw new Error('Missing student exam ID');
    }

    const url = `${this.API_URL}/submit?studentExamId=${encodeURIComponent(studentExamId)}`;
    
    localStorage.setString(`exam_submitting_${studentExamId}`, 'true');
    
    try {
      const response = await axiosClient.post(url, {}, {
        timeout: 15000
      });
      
      // Process response data
      const processedResponse = {
        ...response.data
      };
      
      // Normalize response structure
      if (processedResponse.correctAnswers === undefined && processedResponse.result) {
        processedResponse.correctAnswers = processedResponse.result.correctAnswers;
        processedResponse.wrongAnswers = processedResponse.result.wrongAnswers;
        processedResponse.totalQuestions = processedResponse.result.totalQuestions;
        processedResponse.score = processedResponse.result.score;
      }
      
      localStorage.set('last_exam_result', processedResponse);
      localStorage.remove(`exam_submitting_${studentExamId}`);
      
      return {
        ...response,
        data: processedResponse
      };
    } catch (error) {
      localStorage.remove(`exam_submitting_${studentExamId}`);
      throw error;
    }
  }

  async getStudentExamResult(studentExamId) {
    if (!studentExamId) {
      throw new Error('Missing student exam ID');
    }

    const url = `${this.API_URL}/${studentExamId}`;
    return axiosClient.get(url, {
      timeout: 5000
    });
  }

  async checkExamStatus(examId) {
    if (!examId) {
      throw new Error('Missing exam ID');
    }

    try {
      const completedExams = localStorage.get('completedExams') || {};
      if (completedExams[examId]) {
        return { data: { status: 'COMPLETED', fromCache: true } };
      }
    } catch (e) {
      console.error('Error checking local storage:', e);
    }
    
    return { data: { status: 'UNKNOWN' } };
  }

  async getStudentExamsByExamId(examId) {
    if (!examId) {
      throw new Error('Missing exam ID');
    }

    const url = `${this.API_URL}/exam/${examId}`;
    return axiosClient.get(url, {
      timeout: 10000
    });
  }

  async getStudentExamDetail(studentExamId) {
    if (!studentExamId) {
      throw new Error('Missing student exam ID');
    }

    const url = `${this.API_URL}/detail/${studentExamId}`;
    return axiosClient.get(url, {
      timeout: 10000
    });
  }

  async checkTab(studentExamId) {
    if (!studentExamId) {
      throw new Error('Missing student exam ID');
    }

    const url = `${this.API_URL}/switch-tab/${encodeURIComponent(studentExamId)}`;
    
    try {
      const response = await axiosClient.put(url, {}, {
        timeout: 5000
      });
      
      if (response.data?.switchTabCount !== undefined) {
        localStorage.setString(`tab_switch_count_${studentExamId}`, 
          response.data.switchTabCount.toString());
      }
      
      return response;
    } catch (error) {
      console.error('Error recording tab switch:', error);
      throw error;
    }
  }
}

export default new StudentExamRepository();

