/**
 * Class Repository Interface
 * Defines the contract for class operations
 */
class IClassRepository {
  async getAllClasses(page = 0, size = 10) {
    throw new Error('getAllClasses() must be implemented');
  }

  async getClassesByTeacher(teacherId, page = 0, size = 10) {
    throw new Error('getClassesByTeacher() must be implemented');
  }

  async getStudentClasses(studentId, page = 0, size = 10) {
    throw new Error('getStudentClasses() must be implemented');
  }

  async getClassById(id) {
    throw new Error('getClassById() must be implemented');
  }

  async createClass(classData) {
    throw new Error('createClass() must be implemented');
  }

  async updateClass(id, classData) {
    throw new Error('updateClass() must be implemented');
  }

  async deleteClass(id) {
    throw new Error('deleteClass() must be implemented');
  }

  async getStudentsInClass(classId, page = 0, size = 10) {
    throw new Error('getStudentsInClass() must be implemented');
  }

  async addStudentToClass(classId, usernameOrEmail) {
    throw new Error('addStudentToClass() must be implemented');
  }

  async removeStudentFromClass(classId, usernameOrEmail) {
    throw new Error('removeStudentFromClass() must be implemented');
  }

  async importStudentsFromCsv(classId, file) {
    throw new Error('importStudentsFromCsv() must be implemented');
  }
}

export default IClassRepository;

