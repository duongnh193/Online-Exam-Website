import IQuestionRepository from '../../domain/repositories/IQuestionRepository';
import axiosClient from '../../infrastructure/http/axiosClient';
import QuestionMapper from '../mappers/QuestionMapper';
import Question from '../../domain/entities/Question';

/**
 * Question Repository Implementation
 */
class QuestionRepository extends IQuestionRepository {
  constructor() {
    super();
    this.API_URL = '/v1/questions';
  }

  async createQuestion(questionData) {
    // Validate using domain entity
    const question = new Question({
      examId: questionData.examId,
      title: questionData.title,
      type: questionData.type,
      choices: questionData.choices || [],
      answer: questionData.answer || '',
      image: questionData.image || null,
      creatorId: questionData.user_id
    });

    const validation = question.validate();
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = currentUser.id;
    
    if (!userId) {
      throw new Error('Authentication error: Please login again');
    }

    const formattedData = QuestionMapper.toApi({
      ...question,
      creatorId: userId
    });

    try {
      return await axiosClient.post(this.API_URL, formattedData);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          throw new Error('Invalid question format. Please check all required fields.');
        } else if (status === 404) {
          throw new Error('Exam not found. Please refresh the page and try again.');
        } else if (status === 403) {
          throw new Error('You do not have permission to add questions to this exam.');
        } else if (status === 401) {
          throw new Error('Authentication error. Please login again.');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later or contact support.');
        }
      }
      throw error;
    }
  }

  async updateQuestion(questionId, questionData) {
    const url = `${this.API_URL}/${questionId}`;
    return axiosClient.put(url, questionData);
  }

  async deleteQuestion(questionId) {
    const url = `${this.API_URL}/${questionId}`;
    return axiosClient.delete(url);
  }

  async getQuestionById(questionId) {
    const url = `${this.API_URL}/${questionId}`;
    return axiosClient.get(url);
  }

  async getQuestionsByExam(examId, page = 0, size = 10) {
    if (!examId || examId === 0 || examId === '0') {
      throw new Error('Invalid exam ID');
    }
    
    const url = `${this.API_URL}?examId=${examId}&page=${page}&size=${size}`;
    
    try {
      const response = await axiosClient.get(url);
      
      if (!response.data) {
        return { data: { content: [] } };
      }
      
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: { content: [] } };
      }
      throw error;
    }
  }

  async getAllQuestionsInExam(examId) {
    const url = `${this.API_URL}?examId=${examId}&page=0&size=1000`;
    return axiosClient.get(url);
  }

  async importQuestionsFromCsv(file, examId) {
    if (!examId) {
      throw new Error('No examId provided');
    }
    
    const url = `${this.API_URL}/questions/import?examId=${examId}`;
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      return await axiosClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
    } catch (error) {
      if (error.response) {
        const { status } = error.response;
        if (status === 400) {
          throw new Error('Invalid CSV format or data. Please check your file and try again.');
        } else if (status === 404) {
          throw new Error('Exam not found. Please refresh the page and try again.');
        } else if (status === 413) {
          throw new Error('File is too large. Please use a smaller file.');
        } else if (status === 500) {
          throw new Error('Server error. Please try again later or contact support.');
        }
      }
      throw error;
    }
  }
}

export default new QuestionRepository();

