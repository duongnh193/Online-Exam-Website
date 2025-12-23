import IExamRepository from '../../domain/repositories/IExamRepository';
import axiosClient from '../../infrastructure/http/axiosClient';
import ExamMapper from '../mappers/ExamMapper';
import Exam from '../../domain/entities/Exam';

/**
 * Exam Repository Implementation
 */
class ExamRepository extends IExamRepository {
  constructor() {
    super();
    this.API_URL = '/v1/exams';
  }

  async createExam(examData) {
    const response = await axiosClient.post(this.API_URL, examData);
    return response;
  }

  async updateExam(examId, examData) {
    const response = await axiosClient.put(`${this.API_URL}/${examId}`, examData);
    return response;
  }

  async deleteExam(examId) {
    if (!examId || examId === 0) {
      throw new Error('Invalid exam ID provided');
    }
    const response = await axiosClient.delete(`${this.API_URL}/${examId}`);
    return response;
  }

  async getExamById(examId) {
    if (!examId || examId === 0 || examId === '0') {
      throw new Error('Invalid exam ID provided');
    }

    const response = await axiosClient.get(`${this.API_URL}/${examId}`);
    
    if (response.data) {
      const exam = ExamMapper.toDomain(response.data);
      // Calculate status using domain logic
      const calculatedStatus = exam.calculateStatus();
      exam.status = calculatedStatus;
      
      return {
        ...response,
        data: {
          ...response.data,
          status: calculatedStatus
        }
      };
    }
    
    return response;
  }

  async getExamsByClass(classId, page = 0, size = 10) {
    if (!classId) {
      throw new Error('No classId provided');
    }

    const numericClassId = Number(classId);
    if (isNaN(numericClassId)) {
      throw new Error('Invalid classId format');
    }

    let url = `${this.API_URL}?classId=${numericClassId}&page=${page}&size=${size}`;
    
    try {
      const response = await axiosClient.get(url);
      
      if (response.data) {
        // Process exams and calculate status
        if (response.data.content) {
          response.data.content = response.data.content.map(examData => {
            const exam = ExamMapper.toDomain(examData);
            exam.status = exam.calculateStatus();
            return ExamMapper.toApi(exam);
          });
        } else if (Array.isArray(response.data)) {
          response.data = response.data.map(examData => {
            const exam = ExamMapper.toDomain(examData);
            exam.status = exam.calculateStatus();
            return ExamMapper.toApi(exam);
          });
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching exams:', error.message);
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
    }
  }

  async getExamsByTeacher(teacherId, page = 0, size = 10) {
    if (!teacherId || teacherId === 0 || teacherId === '0') {
      throw new Error('Invalid teacher ID provided');
    }

    const url = `${this.API_URL}/teacher/${teacherId}/all?page=${page}&size=${size}`;
    
    try {
      const response = await axiosClient.get(url);
      
      if (response.data && response.data.content) {
        response.data.content = response.data.content.map(examData => {
          const exam = ExamMapper.toDomain(examData);
          exam.status = exam.calculateStatus();
          return ExamMapper.toApi(exam);
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching exams by teacher:', error);
      throw error;
    }
  }

  async getAllExams(page = 0, size = 10) {
    const url = `${this.API_URL}/all?page=${page}&size=${size}`;
    
    try {
      const response = await axiosClient.get(url);
      
      if (response.data && response.data.content) {
        response.data.content = response.data.content.map(examData => {
          const exam = ExamMapper.toDomain(examData);
          exam.status = exam.calculateStatus();
          return ExamMapper.toApi(exam);
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching all exams:', error);
      throw error;
    }
  }

  async getExamPassword(examId) {
    if (!examId || examId === 0 || examId === '0') {
      throw new Error('Invalid exam ID provided');
    }

    const response = await axiosClient.get(`${this.API_URL}/password/${examId}`);
    return response.data.password;
  }
}

export default new ExamRepository();

