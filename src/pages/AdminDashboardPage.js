import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import { userService } from '../services/userService';
import classService from '../services/classService';
import examService from '../services/examService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  ThemeStyles,
  DashboardContainer,
  Sidebar,
  Logo,
  SidebarMenu,
  NavItem,
  NavIcon,
  BottomMenu,
  MainContent,
  Header,
  HeaderRight,
  NotificationIcon,
  UserAvatar,
  DropdownContainer,
  Dropdown,
  DropdownItem,
  PageTitle,
  SortDropdown,
  CardsContainer,
  CardRow,
  Card,
  CardHeader,
  CardValue,
  ChartContainer,
  StatButton,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  Pagination,
  PageInfo,
  PageButtons,
  PageButton,
  LoadingSpinner,
  ErrorMessage,
  CardGrid,
  DataCard,
  CardInfo,
  CardActions,
  ActionButton,
  StatusBadge,
  SkeletonCard,
  SkeletonLine,
  TabsContainer,
  TabButton,
  ViewToggle,
  ViewToggleButton,
  SearchContainer,
  SearchIcon,
  SearchInput
} from '../components/dashboard/DashboardStyles';

function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [sortOption, setSortOption] = useState('recent');
  const [examCount, setExamCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [classCount, setClassCount] = useState(0);
  const [lecturerCount, setLecturerCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  
  // State cho modal và dữ liệu
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  
  // Thêm state cho view mode và search
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'completed', etc
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const studentCountData = await dashboardService.getStudentCount();
        const classCountData = await dashboardService.getTotalClasses();
        const lecturerCountData = await dashboardService.getLecturerCount();
        const examCountData = await dashboardService.getTotalExams();
        
        setStudentCount(studentCountData);
        setClassCount(classCountData);
        setLecturerCount(lecturerCountData);
        setExamCount(examCountData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, []);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Dữ liệu biểu đồ cho tổng số bài thi
  const examData = [
    { name: 'Jan', count: 40 },
    { name: 'Feb', count: 20 },
    { name: 'Mar', count: 40 },
    { name: 'Apr', count: 30 },
    { name: 'May', count: 50 },
    { name: 'Jun', count: 60 },
    { name: 'Jul', count: 70 },
    { name: 'Aug', count: examCount }
  ];
  
  // Dữ liệu biểu đồ cho tổng số sinh viên
  const studentData = [
    { name: 'Jan', count: 100 },
    { name: 'Feb', count: 80 },
    { name: 'Mar', count: 40 },
    { name: 'Apr', count: 100 },
    { name: 'May', count: 60 },
    { name: 'Jun', count: 80 },
    { name: 'Jul', count: 100 },
    { name: 'Aug', count: studentCount }
  ];
  
  const handleLogout = () => {
    // Make sure the dropdowns are closed
    setShowDropdown(false);
    
    // Hiển thị modal xác nhận thay vì gọi logout trực tiếp
    setShowLogoutConfirmation(true);
    localStorage.removeItem("theme"); 
  };
  
  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirmation(false);
  };
  
  // Get user's first initial
  const getUserInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'J';
  };

  // Get user's full name
  const getFullName = () => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      return `${firstName} ${lastName}`.trim() || user.username || 'User';
    }
    return 'User';
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getMenuIcon = (name) => {
    switch(name) {
      case 'dashboard': return '🏠';
      case 'exams': return '📝';
      case 'class': return '📋';
      case 'reports': return '📊';
      // case 'payment': return '💳';
      // case 'users': return '👥';
      case 'settings': return '⚙️';
      case 'signout': return '🚪';
      default: return '•';
    }
  };

  // Hàm xử lý mở modal và load dữ liệu
  const handleOpenModal = async (type) => {
    setModalType(type);
    setCurrentPage(0);
    setModalData([]);
    setError(null);
    setLoading(true);
    setModalOpen(true);
    setSearchQuery('');
    setViewMode('card');
    setActiveTab('all');
    
    try {
      let response;
      switch(type) {
        case 'students':
          setModalTitle('Student List');
          response = await userService.getAllStudents(currentPage, pageSize);
          break;
        case 'lecturers':
          setModalTitle('Lecturer List');
          response = await userService.getAllLecturers(currentPage, pageSize);
          break;
        case 'exams':
          setModalTitle('Exam List');
          response = await examService.getExams(currentPage, pageSize);
          break;
        case 'classes':
          setModalTitle('Class List');
          response = await classService.getAllClasses(currentPage, pageSize);
          break;
        default:
          setError('Invalid data type');
          setLoading(false);
          return;
      }
      
      // Xử lý dữ liệu phản hồi, trích xuất nội dung và thông tin phân trang
      if (response && response.data) {
        const responseData = response.data;
        
        // Kiểm tra nếu là dữ liệu phân trang
        if (responseData.content) {
          let processedClasses = responseData.content;
          
          // Nếu là classes, lấy thêm student count và teacher name cho mỗi class
          if (type === 'classes') {
            const classesWithStudentCountAndTeacher = await Promise.all(
              processedClasses.map(async (cls) => {
                try {
                  // Fetch student count
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  
                  // Fetch teacher information using teacherId
                  let teacherName = 'Unknown Teacher';
                  if (cls.teacherId) {
                    try {
                      const teacherResponse = await userService.getUserById(cls.teacherId);
                      if (teacherResponse && teacherResponse.data) {
                        const teacher = teacherResponse.data;
                        // Ghép firstName và lastName, fallback to username nếu không có
                        teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.username || 'Unknown Teacher';
                      }
                    } catch (teacherError) {
                      console.error(`Error fetching teacher ${cls.teacherId}:`, teacherError);
                      teacherName = `Teacher ID: ${cls.teacherId}`;
                    }
                  }
                  
                  return {
                    ...cls,
                    studentCount: studentCount,
                    teacherName: teacherName
                  };
                } catch (error) {
                  console.error(`Error fetching data for class ${cls.id}:`, error);
                  return {
                    ...cls,
                    studentCount: 0,
                    teacherName: cls.teacherId ? `Teacher ID: ${cls.teacherId}` : 'Unknown Teacher'
                  };
                }
              })
            );
            processedClasses = classesWithStudentCountAndTeacher;
          }
          
          setModalData(processedClasses);
          setTotalPages(responseData.totalPages || 1);
          setTotalElements(responseData.totalElements || processedClasses.length);
        } else if (Array.isArray(responseData)) {
          // Nếu là một mảng đơn giản
          let processedData = responseData;
          
          // Nếu là classes, lấy thêm student count và teacher name cho mỗi class
          if (type === 'classes') {
            const classesWithStudentCountAndTeacher = await Promise.all(
              processedData.map(async (cls) => {
                try {
                  // Fetch student count
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  
                  // Fetch teacher information using teacherId
                  let teacherName = 'Unknown Teacher';
                  if (cls.teacherId) {
                    try {
                      const teacherResponse = await userService.getUserById(cls.teacherId);
                      if (teacherResponse && teacherResponse.data) {
                        const teacher = teacherResponse.data;
                        // Ghép firstName và lastName, fallback to username nếu không có
                        teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.username || 'Unknown Teacher';
                      }
                    } catch (teacherError) {
                      console.error(`Error fetching teacher ${cls.teacherId}:`, teacherError);
                      teacherName = `Teacher ID: ${cls.teacherId}`;
                    }
                  }
                  
                  return {
                    ...cls,
                    studentCount: studentCount,
                    teacherName: teacherName
                  };
                } catch (error) {
                  console.error(`Error fetching data for class ${cls.id}:`, error);
                  return {
                    ...cls,
                    studentCount: 0,
                    teacherName: cls.teacherId ? `Teacher ID: ${cls.teacherId}` : 'Unknown Teacher'
                  };
                }
              })
            );
            processedData = classesWithStudentCountAndTeacher;
          }
          
          setModalData(processedData);
          setTotalPages(1);
          setTotalElements(processedData.length);
        } else {
          // Trường hợp khác
          console.error('Unexpected response format:', responseData);
          setModalData([]);
          setError('Unexpected data format received');
        }
      } else {
        setModalData([]);
        setError('No data available');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm xử lý chuyển trang
  const handlePageChange = async (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    
    setCurrentPage(newPage);
    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch(modalType) {
        case 'students':
          response = await userService.getAllStudents(newPage, pageSize);
          break;
        case 'lecturers':
          response = await userService.getAllLecturers(newPage, pageSize);
          break;
        case 'exams':
          response = await examService.getExams(newPage, pageSize);
          break;
        case 'classes':
          response = await classService.getAllClasses(newPage, pageSize);
          break;
        default:
          setError('Invalid data type');
          setLoading(false);
          return;
      }
      
      if (response && response.data) {
        const responseData = response.data;
        
        if (responseData.content) {
          let processedClasses = responseData.content;
          
          // Nếu là classes, lấy thêm student count và teacher name cho mỗi class
          if (modalType === 'classes') {
            const classesWithStudentCountAndTeacher = await Promise.all(
              processedClasses.map(async (cls) => {
                try {
                  // Fetch student count
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  
                  // Fetch teacher information using teacherId
                  let teacherName = 'Unknown Teacher';
                  if (cls.teacherId) {
                    try {
                      const teacherResponse = await userService.getUserById(cls.teacherId);
                      if (teacherResponse && teacherResponse.data) {
                        const teacher = teacherResponse.data;
                        // Ghép firstName và lastName, fallback to username nếu không có
                        teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.username || 'Unknown Teacher';
                      }
                    } catch (teacherError) {
                      console.error(`Error fetching teacher ${cls.teacherId}:`, teacherError);
                      teacherName = `Teacher ID: ${cls.teacherId}`;
                    }
                  }
                  
                  return {
                    ...cls,
                    studentCount: studentCount,
                    teacherName: teacherName
                  };
                } catch (error) {
                  console.error(`Error fetching data for class ${cls.id}:`, error);
                  return {
                    ...cls,
                    studentCount: 0,
                    teacherName: cls.teacherId ? `Teacher ID: ${cls.teacherId}` : 'Unknown Teacher'
                  };
                }
              })
            );
            processedClasses = classesWithStudentCountAndTeacher;
          }
          
          setModalData(processedClasses);
          setTotalPages(responseData.totalPages || 1);
          setTotalElements(responseData.totalElements || processedClasses.length);
        } else if (Array.isArray(responseData)) {
          let processedData = responseData;
          
          // Nếu là classes, lấy thêm student count và teacher name cho mỗi class
          if (modalType === 'classes') {
            const classesWithStudentCountAndTeacher = await Promise.all(
              processedData.map(async (cls) => {
                try {
                  // Fetch student count
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  
                  // Fetch teacher information using teacherId
                  let teacherName = 'Unknown Teacher';
                  if (cls.teacherId) {
                    try {
                      const teacherResponse = await userService.getUserById(cls.teacherId);
                      if (teacherResponse && teacherResponse.data) {
                        const teacher = teacherResponse.data;
                        // Ghép firstName và lastName, fallback to username nếu không có
                        teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.username || 'Unknown Teacher';
                      }
                    } catch (teacherError) {
                      console.error(`Error fetching teacher ${cls.teacherId}:`, teacherError);
                      teacherName = `Teacher ID: ${cls.teacherId}`;
                    }
                  }
                  
                  return {
                    ...cls,
                    studentCount: studentCount,
                    teacherName: teacherName
                  };
                } catch (error) {
                  console.error(`Error fetching data for class ${cls.id}:`, error);
                  return {
                    ...cls,
                    studentCount: 0,
                    teacherName: cls.teacherId ? `Teacher ID: ${cls.teacherId}` : 'Unknown Teacher'
                  };
                }
              })
            );
            processedData = classesWithStudentCountAndTeacher;
          }
          
          setModalData(processedData);
        } else {
          console.error('Unexpected response format:', responseData);
          setError('Unexpected data format received');
        }
      }
    } catch (error) {
      console.error('Error fetching data for page change:', error);
      setError(`Failed to load page data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm render nội dung bảng dựa vào loại
  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="5">
            <LoadingSpinner />
          </td>
        </tr>
      );
    }
    
    if (error) {
      return (
        <tr>
          <td colSpan="5">
            <ErrorMessage>{error}</ErrorMessage>
          </td>
        </tr>
      );
    }
    
    if (modalData.length === 0) {
      return (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
            No data available
          </td>
        </tr>
      );
    }
    
    switch(modalType) {
      case 'students':
        return modalData.map(student => (
          <TableRow key={student.id} theme={theme === 'dark' ? 'dark' : 'light'}>
            <TableCell>{student.id}</TableCell>
            <TableCell>{student.username}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell>{`${student.firstName || ''} ${student.lastName || ''}`.trim() || '-'}</TableCell>
            <TableCell>STUDENT</TableCell>
          </TableRow>
        ));
        
      case 'lecturers':
        return modalData.map(lecturer => (
          <TableRow key={lecturer.id} theme={theme === 'dark' ? 'dark' : 'light'}>
            <TableCell>{lecturer.id}</TableCell>
            <TableCell>{lecturer.username}</TableCell>
            <TableCell>{lecturer.email}</TableCell>
            <TableCell>{`${lecturer.firstName || ''} ${lecturer.lastName || ''}`.trim() || '-'}</TableCell>
            <TableCell>LECTURER</TableCell>
          </TableRow>
        ));
        
      case 'exams':
        return modalData.map(exam => (
          <TableRow key={exam.id} theme={theme === 'dark' ? 'dark' : 'light'}>
            <TableCell>{exam.id}</TableCell>
            <TableCell>{exam.title}</TableCell>
            <TableCell>{exam.className || `Class ${exam.classId}` || '-'}</TableCell>
            <TableCell>{exam.duration} minutes</TableCell>
            <TableCell>{exam.status || 'SCHEDULED'}</TableCell>
          </TableRow>
        ));
        
      case 'classes':
        return modalData.map(cls => (
          <TableRow key={cls.id} theme={theme === 'dark' ? 'dark' : 'light'}>
            <TableCell>{cls.id}</TableCell>
            <TableCell>{cls.name}</TableCell>
            <TableCell>{cls.description || '-'}</TableCell>
            <TableCell>{cls.teacherName || '-'}</TableCell>
            <TableCell>{cls.studentCount || 0}</TableCell>
          </TableRow>
        ));
        
      default:
        return (
          <tr>
            <td colSpan="5" style={{ textAlign: 'center' }}>
              Invalid data type
            </td>
          </tr>
        );
    }
  };
  
  // Hàm render header bảng dựa vào loại
  const renderTableHeader = () => {
    switch(modalType) {
      case 'students':
        return (
          <tr>
            <TableHeader>ID</TableHeader>
            <TableHeader>Username</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Role</TableHeader>
          </tr>
        );
        
      case 'lecturers':
        return (
          <tr>
            <TableHeader>ID</TableHeader>
            <TableHeader>Username</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Role</TableHeader>
          </tr>
        );
        
      case 'exams':
        return (
          <tr>
            <TableHeader>ID</TableHeader>
            <TableHeader>Title</TableHeader>
            <TableHeader>Class</TableHeader>
            <TableHeader>Duration</TableHeader>
            <TableHeader>Status</TableHeader>
          </tr>
        );
        
      case 'classes':
        return (
          <tr>
            <TableHeader>ID</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Teacher</TableHeader>
            <TableHeader>Students</TableHeader>
          </tr>
        );
        
      default:
        return (
          <tr>
            <TableHeader>No data available</TableHeader>
          </tr>
        );
    }
  };

  // Hàm lọc dữ liệu dựa trên search query
  const getFilteredData = () => {
    if (!searchQuery.trim()) return modalData;
    
    return modalData.filter(item => {
      switch(modalType) {
        case 'students':
        case 'lecturers':
          return (
            (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (`${item.firstName || ''} ${item.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        case 'exams':
          return (
            (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.className && item.className.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        case 'classes':
          return (
            (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.teacherName && item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        default:
          return false;
      }
    });
  };
  
  // Hàm lọc theo tab
  const getFilteredByTab = (data) => {
    if (activeTab === 'all') return data;
    
    return data.filter(item => {
      switch(modalType) {
        case 'exams':
          return item.status && item.status.toLowerCase() === activeTab.toLowerCase();
        default:
          return true;
      }
    });
  };
  
  // Hàm render card hiển thị dữ liệu
  const renderDataCards = () => {
    const filteredData = getFilteredByTab(getFilteredData());
    
    if (loading) {
      return Array(6).fill(0).map((_, i) => (
        <SkeletonCard key={i}>
          <SkeletonLine width="60%" />
          <SkeletonLine width="100%" />
          <SkeletonLine width="70%" />
          <SkeletonLine width="40%" />
        </SkeletonCard>
      ));
    }
    
    if (error) {
      return (
        <div style={{ gridColumn: '1 / -1' }}>
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      );
    }
    
    if (filteredData.length === 0) {
      return (
        <div style={{ 
          gridColumn: '1 / -1', 
          textAlign: 'center', 
          padding: '3rem',
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '1rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>No data found</div>
          <div>Try adjusting your search or filters</div>
        </div>
      );
    }
    
    switch(modalType) {
      case 'students':
        return filteredData.map(student => (
          <DataCard key={student.id} type="student">
            <CardHeader>{`${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student'}</CardHeader>
            <CardInfo><strong>Username:</strong> {student.username}</CardInfo>
            <CardInfo><strong>Email:</strong> {student.email}</CardInfo>
            <CardInfo><strong>ID:</strong> {student.id}</CardInfo>
            <CardActions>
              <ActionButton size="small">View Profile</ActionButton>
            </CardActions>
          </DataCard>
        ));
        
      case 'lecturers':
        return filteredData.map(lecturer => (
          <DataCard key={lecturer.id} type="lecturer">
            <CardHeader>{`${lecturer.firstName || ''} ${lecturer.lastName || ''}`.trim() || 'Lecturer'}</CardHeader>
            <CardInfo><strong>Username:</strong> {lecturer.username}</CardInfo>
            <CardInfo><strong>Email:</strong> {lecturer.email}</CardInfo>
            <CardInfo><strong>ID:</strong> {lecturer.id}</CardInfo>
            <CardActions>
              <ActionButton size="small">View Profile</ActionButton>
            </CardActions>
          </DataCard>
        ));
        
      case 'exams':
        return filteredData.map(exam => (
          <DataCard key={exam.id} type="exam">
            <CardHeader>{exam.title}</CardHeader>
            <CardInfo><strong>Class:</strong> {exam.className || `Class ${exam.classId}` || '-'}</CardInfo>
            <CardInfo><strong>Duration:</strong> {exam.duration} minutes</CardInfo>
            <CardInfo>
              <strong>Status:</strong> 
              <StatusBadge status={exam.status}>{exam.status || 'SCHEDULED'}</StatusBadge>
            </CardInfo>
            <CardActions>
              <ActionButton size="small">View Details</ActionButton>
            </CardActions>
          </DataCard>
        ));
        
      case 'classes':
        return filteredData.map(cls => (
          <DataCard key={cls.id} type="class">
            <CardHeader>{cls.name}</CardHeader>
            <CardInfo><strong>Description:</strong> {cls.description || '-'}</CardInfo>
            <CardInfo><strong>Teacher:</strong> {cls.teacherName || '-'}</CardInfo>
            <CardInfo><strong>Students:</strong> {cls.studentCount || 0}</CardInfo>
            <CardActions>
              <ActionButton size="small">View Class</ActionButton>
            </CardActions>
          </DataCard>
        ));
        
      default:
        return (
          <div style={{ gridColumn: '1 / -1' }}>Invalid data type</div>
        );
    }
  };
  
  // Cập nhật phần render modal
  const modalContent = (
    <ModalContainer>
      <ModalHeader>
        <ModalTitle>{modalTitle}</ModalTitle>
        <CloseButton onClick={() => setModalOpen(false)}>×</CloseButton>
      </ModalHeader>
      
      {/* Tabs for filtering - only show for exams which have status */}
      {modalType === 'exams' && (
        <TabsContainer>
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            All
          </TabButton>
          <TabButton 
            active={activeTab === 'scheduled'} 
            onClick={() => setActiveTab('scheduled')}
          >
            Scheduled
          </TabButton>
          <TabButton 
            active={activeTab === 'ongoing'} 
            onClick={() => setActiveTab('ongoing')}
          >
            Ongoing
          </TabButton>
          <TabButton 
            active={activeTab === 'completed'} 
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </TabButton>
        </TabsContainer>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <ViewToggle>
          <ViewToggleButton 
            active={viewMode === 'card'} 
            onClick={() => setViewMode('card')}
          >
            <span>📇</span> Cards
          </ViewToggleButton>
          <ViewToggleButton 
            active={viewMode === 'table'} 
            onClick={() => setViewMode('table')}
          >
            <span>📋</span> Table
          </ViewToggleButton>
        </ViewToggle>
        
        <SearchContainer>
          <SearchIcon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder={`Search ${modalType || 'items'}...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
      </div>
      
      {viewMode === 'card' ? (
        <CardGrid>
          {renderDataCards()}
        </CardGrid>
      ) : (
        <Table>
          <thead>
            {renderTableHeader()}
          </thead>
          <tbody>
            {renderTableContent()}
          </tbody>
        </Table>
      )}
      
      <Pagination>
        <PageInfo>
          Showing {modalData.length > 0 ? currentPage * pageSize + 1 : 0} 
          to {modalData.length > 0 ? Math.min((currentPage + 1) * pageSize, totalElements) : 0} 
          of {totalElements} entries
        </PageInfo>
        <PageButtons>
          <PageButton 
            onClick={() => handlePageChange(0)} 
            disabled={currentPage === 0}
          >
            First
          </PageButton>
          <PageButton 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 0}
          >
            Previous
          </PageButton>
          <PageButton active>
            {currentPage + 1}
          </PageButton>
          <PageButton 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </PageButton>
          <PageButton 
            onClick={() => handlePageChange(totalPages - 1)} 
            disabled={currentPage >= totalPages - 1}
          >
            Last
          </PageButton>
        </PageButtons>
      </Pagination>
    </ModalContainer>
  );
  
  return (
    <DashboardContainer>
      <Sidebar theme={theme}>
        <Logo>logo</Logo>
        <SidebarMenu>
          <NavItem to="/admin-dashboard" className="active">
            <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
            Dashboard
          </NavItem>
          <NavItem to="/exams">
            <NavIcon>{getMenuIcon('exams')}</NavIcon>
            Exams
          </NavItem>
          <NavItem to="/class">
            <NavIcon>{getMenuIcon('class')}</NavIcon>
            Class
          </NavItem>
          <NavItem to="/reports">
            <NavIcon>{getMenuIcon('reports')}</NavIcon>
            Reports
          </NavItem>
          {/* <NavItem to="/payment">
            <NavIcon>{getMenuIcon('payment')}</NavIcon>
            Payment
          </NavItem>
          <NavItem to="/users">
            <NavIcon>{getMenuIcon('users')}</NavIcon>
            Users
          </NavItem> */}
        </SidebarMenu>
        <BottomMenu>
          <NavItem to="/settings">
            <NavIcon>{getMenuIcon('settings')}</NavIcon>
            Settings
          </NavItem>
          <NavItem to="#" onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}>
            <NavIcon>{getMenuIcon('signout')}</NavIcon>
            Sign out
          </NavItem>
        </BottomMenu>
      </Sidebar>
      
      <MainContent>
        <Header>
          <PageTitle>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {getFullName()}</p>
          </PageTitle>
          
          <HeaderRight>
            <ThemeToggle />
            <NotificationIcon />
            <DropdownContainer ref={dropdownRef}>
              <UserAvatar onClick={toggleDropdown}>{getUserInitial()}</UserAvatar>
              {showDropdown && (
                <Dropdown>
                  <DropdownItem>
                    <span>👤</span> Profile
                  </DropdownItem>
                  <DropdownItem>
                    <span>⚙️</span> Settings
                  </DropdownItem>
                  <DropdownItem onClick={handleLogout}>
                    <span>🚪</span> Sign out
                  </DropdownItem>
                </Dropdown>
              )}
            </DropdownContainer>
          </HeaderRight>
        </Header>
        
        {/* Các card thống kê tổng quan */}
        <CardsContainer direction="column" marginBottom="1.5rem">
          <CardRow>
            {/* Hàng 1: Sinh viên và Giảng viên */}
            <Card>
              <CardHeader>Total Students</CardHeader>
              <CardValue color="#ff2e8e">{studentCount || 0}</CardValue>
              <StatButton onClick={() => handleOpenModal('students')} />
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff2e8e" stopOpacity={1} />
                        <stop offset="100%" stopColor="#ff2e8e" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip cursor={false} />
                    <Bar dataKey="count" fill="url(#colorStudents)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
            
            <Card>
              <CardHeader>Total Lecturers</CardHeader>
              <CardValue color="#f5a623">{lecturerCount || 0}</CardValue>
              <StatButton onClick={() => handleOpenModal('lecturers')} />
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={examData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLecturers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f5a623" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f5a623" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip cursor={false} />
                    <Line type="monotone" dataKey="count" stroke="#f5a623" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          </CardRow>
          
          <CardRow>
            {/* Hàng 2: Bài thi và Lớp học */}
            <Card>
              <CardHeader>Total Exams</CardHeader>
              <CardValue color="#6a00ff">{examCount || 0}</CardValue>
              <StatButton onClick={() => handleOpenModal('exams')} />
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={examData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6a00ff" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6a00ff" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip cursor={false} />
                    <Bar dataKey="count" fill="url(#colorExams)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
            
            <Card>
              <CardHeader>Total Classes</CardHeader>
              <CardValue color="#00c16e">{classCount || 0}</CardValue>
              <StatButton onClick={() => handleOpenModal('classes')} />
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={examData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00c16e" stopOpacity={1} />
                        <stop offset="100%" stopColor="#00c16e" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip cursor={false} />
                    <Line type="monotone" dataKey="count" stroke="#00c16e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          </CardRow>
        </CardsContainer>
        
        {/* Modal hiển thị chi tiết */}
        {modalOpen && (
          <ModalOverlay>
            {modalContent}
          </ModalOverlay>
        )}
      </MainContent>
      
      {/* Thêm modal xác nhận đăng xuất */}
      <ConfirmationModal
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleConfirmLogout}
        message="Are you sure you want to logout?"
      />
    </DashboardContainer>
  );
}

export default AdminDashboardPage; 
