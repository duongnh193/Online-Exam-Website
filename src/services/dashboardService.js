import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const STATS_API_URL = 'http://localhost:8080/api/v1/statistics';

// Mock data for development until backend is implemented
const mockExamCount = 23;
const mockStudentCount = 487;
const mockClassCount = 15;
const mockLecturerCount = 32;

const mockActivity = [
  {
    id: 1,
    title: 'Database Systems Midterm',
    type: 'exam',
    date: 'Today, 10:30 AM'
  },
  {
    id: 2,
    title: 'Data Structures Quiz',
    type: 'quiz',
    date: 'Yesterday, 3:15 PM'
  },
  {
    id: 3,
    title: 'Algorithm Analysis',
    type: 'assignment',
    date: '2 days ago'
  },
  {
    id: 4,
    title: 'AI Ethics Research Paper',
    type: 'essay',
    date: '3 days ago'
  },
  {
    id: 5,
    title: 'Machine Learning Final',
    type: 'exam',
    date: '1 week ago'
  }
];

const mockNotifications = [
  {
    id: 1,
    message: 'New exam scheduled: Database Systems Midterm',
    time: '2 hours ago',
    read: false
  },
  {
    id: 2,
    message: 'Your assignment "Algorithm Analysis" has been graded',
    time: 'Yesterday',
    read: false
  },
  {
    id: 3,
    message: 'Reminder: Data Structures Quiz tomorrow',
    time: '2 days ago',
    read: true
  },
  {
    id: 4,
    message: 'AI Ethics Research Paper deadline extended by 2 days',
    time: '3 days ago',
    read: true
  }
];

// Service methods
const dashboardService = {
  // Lấy tổng số bài thi
  getExamCount: async () => {
    try {
      // Sử dụng API thống kê mới
      const response = await axios.get(`${STATS_API_URL}/total-exam`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error fetching exam count:', error);
      // Fallback to mock data if API fails
      return Promise.resolve(mockExamCount);
    }
  },
  
  // Lấy tổng số sinh viên từ API thống kê
  getStudentCount: async () => {
    try {
      // Sử dụng API thống kê
      const response = await axios.get(`${STATS_API_URL}/total-students`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error fetching student count:', error);
      // Fallback to mock data if API fails
      return Promise.resolve(mockStudentCount);
    }
  },
  
  // Lấy tổng số lớp học từ API thống kê
  getClassCount: async () => {
    try {
      // Sử dụng API thống kê
      const response = await axios.get(`${STATS_API_URL}/total-classes`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error fetching class count:', error);
      // Fallback to mock data if API fails
      return Promise.resolve(mockClassCount);
    }
  },
  
  // Lấy tổng số giảng viên từ API thống kê
  getLecturerCount: async () => {
    try {
      // Sử dụng API thống kê
      const response = await axios.get(`${STATS_API_URL}/total-lecturers`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error fetching lecturer count:', error);
      // Fallback to mock data if API fails
      return Promise.resolve(mockLecturerCount);
    }
  },
  
  // Lấy tổng số bài thi trong một lớp từ API thống kê
  getExamsInClass: async (classId) => {
    try {
      if (!classId) return 0;
      
      // Sử dụng API thống kê
      const response = await axios.get(`${STATS_API_URL}/total-exams/${classId}`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error fetching exams in class:', error);
      return 0;
    }
  },
  
  // Lấy thống kê điểm số của một bài thi
  getExamScoreStatistics: async (examId) => {
    try {
      const response = await axios.get(`${STATS_API_URL}/exam-score/${examId}`, { headers: authHeader() });
      console.log('Exam score statistics API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam score statistics:', error);
      return {
        minScore: 0,
        maxScore: 0,
        avgScore: 0
      };
    }
  },
  
  // Lấy danh sách điểm của sinh viên trong một lớp
  getStudentScoresInClass: async (classId, page = 0, size = 20) => {
    try {
      const response = await axios.get(
        `${STATS_API_URL}/student-scores/${classId}?page=${page}&size=${size}`, 
        { headers: authHeader() }
      );
      console.log('Student scores in class API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching student scores for class:', error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0
      };
    }
  },
  
  // Get recent activity
  getRecentActivity: async () => {
    try {
      // Uncomment when API is ready
      // const response = await axios.get(`${API_URL}/dashboard/recent-activity`, { headers: authHeader() });
      // return response.data;
      
      // Using mock data for now
      return Promise.resolve(mockActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return Promise.reject(error);
    }
  },
  
  // Get notifications
  getNotifications: async () => {
    try {
      // Uncomment when API is ready
      // const response = await axios.get(`${API_URL}/notifications`, { headers: authHeader() });
      // return response.data;
      
      // Using mock data for now
      return Promise.resolve(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return Promise.reject(error);
    }
  },
  
  // Mark notification as read
  markNotificationAsRead: async (id) => {
    try {
      // Uncomment when API is ready
      // await axios.put(`${API_URL}/notifications/${id}/read`, {}, { headers: authHeader() });
      // return await dashboardService.getNotifications();
      
      // Using mock data for now
      const updatedNotifications = mockNotifications.map(notif => 
        notif.id === id ? {...notif, read: true} : notif
      );
      return Promise.resolve(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return Promise.reject(error);
    }
  },
  
  // Lấy danh sách tất cả bài thi
  getAllExams: async (page = 0, size = 10) => {
    try {
      // Vì chưa có API cụ thể, chúng ta có thể sử dụng API lấy danh sách bài thi của tất cả lớp học
      // hoặc mock data tạm thời
      console.log('Fetching all exams with page:', page, 'size:', size);
      
      // Mock data tạm thời
      const mockExams = [
        { id: 1, title: 'Midterm Database', classId: 1, className: 'Database Systems', duration: 90, status: 'COMPLETED' },
        { id: 2, title: 'Final Data Structures', classId: 2, className: 'Data Structures', duration: 120, status: 'SCHEDULED' },
        { id: 3, title: 'Midterm Algorithms', classId: 3, className: 'Algorithms', duration: 90, status: 'ONGOING' },
        { id: 4, title: 'Quiz Machine Learning', classId: 4, className: 'Machine Learning', duration: 45, status: 'COMPLETED' },
        { id: 5, title: 'Project AI Ethics', classId: 5, className: 'AI Ethics', duration: 60, status: 'SCHEDULED' },
        { id: 6, title: 'Final Web Development', classId: 6, className: 'Web Development', duration: 120, status: 'SCHEDULED' },
        { id: 7, title: 'Midterm Mobile App', classId: 7, className: 'Mobile App Development', duration: 90, status: 'ONGOING' },
        { id: 8, title: 'Quiz Network Security', classId: 8, className: 'Network Security', duration: 45, status: 'COMPLETED' },
        { id: 9, title: 'Project Cloud Computing', classId: 9, className: 'Cloud Computing', duration: 60, status: 'SCHEDULED' },
        { id: 10, title: 'Final DevOps', classId: 10, className: 'DevOps', duration: 120, status: 'SCHEDULED' },
        { id: 11, title: 'Midterm Software Engineering', classId: 11, className: 'Software Engineering', duration: 90, status: 'COMPLETED' },
        { id: 12, title: 'Quiz Design Patterns', classId: 12, className: 'Design Patterns', duration: 45, status: 'ONGOING' }
      ];
      
      // Tính phân trang
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedExams = mockExams.slice(startIndex, endIndex);
      
      // Tạo response với định dạng phân trang tương tự API thực
      const response = {
        content: paginatedExams,
        totalElements: mockExams.length,
        totalPages: Math.ceil(mockExams.length / size),
        size: size,
        number: page,
        numberOfElements: paginatedExams.length
      };
      
      return Promise.resolve({ data: response });
    } catch (error) {
      console.error('Error fetching all exams:', error);
      return Promise.reject(error);
    }
  }
};

export default dashboardService; 