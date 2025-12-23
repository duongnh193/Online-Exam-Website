/**
 * Service Adapter
 * Provides backward compatibility layer between old services and new repositories
 * This allows gradual migration without breaking existing code
 */
import authRepository from '../repositories/AuthRepository';
import examRepository from '../repositories/ExamRepository';
import classRepository from '../repositories/ClassRepository';
import questionRepository from '../repositories/QuestionRepository';
import studentExamRepository from '../repositories/StudentExamRepository';
import statisticsRepository from '../repositories/StatisticsRepository';
import localStorage from '../../infrastructure/storage/localStorage';

/**
 * Auth Service Adapter - wraps AuthRepository with old service interface
 */
export const authService = {
  register: (userData) => authRepository.register(userData),
  login: (credentials) => authRepository.login(credentials),
  verifyOtp: (otpData) => authRepository.verifyOtp(otpData),
  logout: () => authRepository.logout(),
  isLoggedIn: () => authRepository.isLoggedIn(),
  getToken: () => authRepository.getToken(),
  getAuthHeader: () => {
    const token = authRepository.getToken();
    const tokenType = localStorage.getString('token_type') || 'Bearer';
    return token ? { Authorization: `${tokenType} ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  },
  getCurrentUser: () => authRepository.getCurrentUser(),
  enable2FA: (userId) => authRepository.enable2FA(userId),
  disable2FA: (userId) => authRepository.disable2FA(userId),
  is2FAEnabled: () => authRepository.is2FAEnabled(),
  resendOtp: (usernameOrEmail) => authRepository.resendOtp(usernameOrEmail),
  resetPassword: (emailOrUsername) => authRepository.resetPassword(emailOrUsername),
  updatePassword: (currentPassword, newPassword) => authRepository.updatePassword(currentPassword, newPassword),
  getDashboardByRole: (role) => authRepository.getDashboardByRole(role)
};

/**
 * Exam Service Adapter
 */
class ExamServiceAdapter {
  createExam(examData) {
    return examRepository.createExam(examData);
  }

  updateExam(examId, examData) {
    return examRepository.updateExam(examId, examData);
  }

  deleteExam(examId) {
    return examRepository.deleteExam(examId);
  }

  getExamById(examId) {
    return examRepository.getExamById(examId);
  }

  getExamsByClass(classId, page = 0, size = 10) {
    return examRepository.getExamsByClass(classId, page, size);
  }

  getExamsByTeacher(lecturerId, page = 0, size = 10) {
    return examRepository.getExamsByTeacher(lecturerId, page, size);
  }

  getExams(page = 0, size = 10) {
    return examRepository.getAllExams(page, size);
  }

  getExamPassword(examId) {
    return examRepository.getExamPassword(examId);
  }
}

export const examService = new ExamServiceAdapter();

/**
 * Class Service Adapter
 */
class ClassServiceAdapter {
  getAllClasses(page = 0, size = 10, sort = 'id,asc') {
    return classRepository.getAllClasses(page, size, sort);
  }

  getClassesByTeacher(teacherId, page = 0, size = 10, sort = 'id,asc') {
    return classRepository.getClassesByTeacher(teacherId, page, size, sort);
  }

  getStudentClasses(studentId, page = 0, size = 10) {
    return classRepository.getStudentClasses(studentId, page, size);
  }

  getClassById(id) {
    return classRepository.getClassById(id);
  }

  createClass(classData) {
    return classRepository.createClass(classData);
  }

  updateClass(id, classData) {
    return classRepository.updateClass(id, classData);
  }

  deleteClass(id) {
    return classRepository.deleteClass(id);
  }

  getStudentsInClass(classId, page = 0, size = 10) {
    return classRepository.getStudentsInClass(classId, page, size);
  }

  addStudentToClass(classId, usernameOrEmail) {
    return classRepository.addStudentToClass(classId, usernameOrEmail);
  }

  removeStudentFromClass(classId, usernameOrEmail) {
    return classRepository.removeStudentFromClass(classId, usernameOrEmail);
  }

  importStudentsFromCsv(classId, file) {
    return classRepository.importStudentsFromCsv(classId, file);
  }
}

export const classService = new ClassServiceAdapter();

/**
 * Question Service Adapter
 */
class QuestionServiceAdapter {
  createQuestion(questionData) {
    return questionRepository.createQuestion(questionData);
  }

  updateQuestion(questionId, questionData) {
    return questionRepository.updateQuestion(questionId, questionData);
  }

  deleteQuestion(questionId) {
    return questionRepository.deleteQuestion(questionId);
  }

  getQuestionById(questionId) {
    return questionRepository.getQuestionById(questionId);
  }

  getQuestionsByExam(examId, page = 0, size = 10) {
    return questionRepository.getQuestionsByExam(examId, page, size);
  }

  getAllQuestionsInExam(examId) {
    return questionRepository.getAllQuestionsInExam(examId);
  }

  importQuestionsFromCsv(file, examId) {
    return questionRepository.importQuestionsFromCsv(file, examId);
  }
}

export const questionService = new QuestionServiceAdapter();

/**
 * Student Exam Service Adapter
 */
class StudentExamServiceAdapter {
  startExam(examId, password) {
    return studentExamRepository.startExam(examId, password);
  }

  submitAnswer(studentExamId, questionId, answer, currentQuestionIndex) {
    return studentExamRepository.submitAnswer(studentExamId, questionId, answer, currentQuestionIndex);
  }

  getQuestion(studentExamId, questionIndex) {
    return studentExamRepository.getQuestion(studentExamId, questionIndex);
  }

  submitExam(studentExamId) {
    return studentExamRepository.submitExam(studentExamId);
  }

  getStudentExamResult(studentExamId) {
    return studentExamRepository.getStudentExamResult(studentExamId);
  }

  checkExamStatus(examId) {
    return studentExamRepository.checkExamStatus(examId);
  }

  getStudentExamsByExamId(examId) {
    return studentExamRepository.getStudentExamsByExamId(examId);
  }

  getStudentExamDetail(studentExamId) {
    return studentExamRepository.getStudentExamDetail(studentExamId);
  }

  checkTab(studentExamId) {
    return studentExamRepository.checkTab(studentExamId);
  }
}

export const studentExamService = new StudentExamServiceAdapter();

/**
 * Statistics Service Adapter
 */
class StatisticsServiceAdapter {
  getTotalClasses() {
    return statisticsRepository.getTotalClasses();
  }

  getTotalExamsInClass(classId) {
    return statisticsRepository.getTotalExamsInClass(classId);
  }

  getTotalExams() {
    return statisticsRepository.getTotalExams();
  }

  getTotalLecturers() {
    return statisticsRepository.getTotalLecturers();
  }

  getTotalStudents() {
    return statisticsRepository.getTotalStudents();
  }

  getExamScoreStatistics(examId) {
    return statisticsRepository.getExamScoreStatistics(examId);
  }

  getStudentScores(classId, page = 0, size = 10) {
    return statisticsRepository.getStudentScores(classId, page, size);
  }

  getStudentScoreByClasses(studentId) {
    return statisticsRepository.getStudentScoreByClasses(studentId);
  }
}

export const statisticsService = new StatisticsServiceAdapter();

