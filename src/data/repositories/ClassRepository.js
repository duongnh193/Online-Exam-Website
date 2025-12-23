import IClassRepository from '../../domain/repositories/IClassRepository';
import axiosClient from '../../infrastructure/http/axiosClient';
import ClassMapper from '../mappers/ClassMapper';

/**
 * Class Repository Implementation
 */
class ClassRepository extends IClassRepository {
  constructor() {
    super();
    this.API_URL = '/v1/classes';
  }

  async getAllClasses(page = 0, size = 10, sort = 'id,asc') {
    const url = `${this.API_URL}/all?page=${page}&size=${size}&sort=${sort}`;
    return axiosClient.get(url);
  }

  async getClassesByTeacher(teacherId, page = 0, size = 10, sort = 'id,asc') {
    const url = `${this.API_URL}/by-teacher?teacherId=${teacherId}&page=${page}&size=${size}&sort=${sort}`;
    return axiosClient.get(url);
  }

  async getStudentClasses(studentId, page = 0, size = 10) {
    if (!studentId) {
      throw new Error('No studentId provided');
    }
    
    const url = `${this.API_URL}/by-student?studentId=${studentId}&page=${page}&size=${size}`;
    
    try {
      return await axiosClient.get(url);
    } catch (error) {
      console.error('Error fetching student classes:', error);
      if (error.response?.status === 404) {
        return { data: { content: [] } };
      }
      throw error;
    }
  }

  async getClassById(id) {
    const url = `${this.API_URL}/${id}`;
    return axiosClient.get(url);
  }

  async createClass(classData) {
    return axiosClient.post(this.API_URL, classData);
  }

  async updateClass(id, classData) {
    const url = `${this.API_URL}/${id}`;
    return axiosClient.put(url, classData);
  }

  async deleteClass(id) {
    const url = `${this.API_URL}/${id}`;
    return axiosClient.delete(url);
  }

  async getStudentsInClass(classId, page = 0, size = 10) {
    const url = `${this.API_URL}/${classId}/students?page=${page}&size=${size}`;
    
    try {
      return await axiosClient.get(url);
    } catch (error) {
      console.error(`Error fetching students for class ${classId}:`, error);
      throw error;
    }
  }

  async addStudentToClass(classId, usernameOrEmail) {
    const url = `${this.API_URL}/${classId}/add-student?usernameOrEmail=${encodeURIComponent(usernameOrEmail)}`;
    return axiosClient.post(url, {});
  }

  async removeStudentFromClass(classId, usernameOrEmail) {
    const url = `${this.API_URL}/${classId}/remove-student?usernameOrEmail=${encodeURIComponent(usernameOrEmail)}`;
    return axiosClient.delete(url);
  }

  async importStudentsFromCsv(classId, file) {
    const url = `${this.API_URL}/${classId}/import`;
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

export default new ClassRepository();

