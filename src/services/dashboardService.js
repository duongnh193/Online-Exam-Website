import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Mock data for development until backend is implemented
const mockExamCount = 23;
const mockStudentCount = 487;

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
  // Get the count of exams
  getExamCount: async () => {
    try {
      // Uncomment when API is ready
      // const response = await axios.get(`${API_URL}/dashboard/exam-count`, { headers: authHeader() });
      // return response.data;
      
      // Using mock data for now
      return Promise.resolve(mockExamCount);
    } catch (error) {
      console.error('Error fetching exam count:', error);
      return Promise.reject(error);
    }
  },
  
  // Get the count of students
  getStudentCount: async () => {
    try {
      // Uncomment when API is ready
      // const response = await axios.get(`${API_URL}/dashboard/student-count`, { headers: authHeader() });
      // return response.data;
      
      // Using mock data for now
      return Promise.resolve(mockStudentCount);
    } catch (error) {
      console.error('Error fetching student count:', error);
      return Promise.reject(error);
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
  }
};

export default dashboardService; 