import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import { userService } from '../services/userService';
import classService from '../services/classService';
import examService from '../services/examService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';

// Theme variables
const ThemeStyles = createGlobalStyle`
  .light-theme {
    --bg-primary: #f8f9fa;
    --bg-secondary: #ffffff;
    --bg-sidebar: #6a00ff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #eeeeee;
    --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    --highlight-color: #6a00ff;
  }
  
  .dark-theme {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2a2a2a;
    --bg-sidebar: #3a3a3a;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border-color: #444444;
    --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    --highlight-color: #8d47ff;
  }
`;

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
`;

const Sidebar = styled.aside`
  width: 180px;
  background-color: ${props => props.theme === 'dark' ? 'var(--bg-sidebar)' : '#6a00ff'};
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 0 20px 20px 0;
  transition: background-color 0.3s ease;
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: "⦿⦿⦿";
    letter-spacing: 2px;
    font-size: 10px;
    margin-right: 8px;
    color: white;
  }
`;

const SidebarMenu = styled.div`
  flex: 1;
  margin-top: 1rem;
`;

const NavItem = styled(Link)`
  padding: 0.75rem 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
  text-decoration: none;
  font-size: 0.9rem;
  
  &.active {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: white;
  }
`;

const NavIcon = styled.span`
  margin-right: 12px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  opacity: 0.9;
`;

const BottomMenu = styled.div`
  margin-bottom: 2rem;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 180px;
  padding: 2rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NotificationIcon = styled.div`
  width: 24px;
  height: 24px;
  position: relative;
  cursor: pointer;
  
  &::before {
    content: '🔔';
    font-size: 18px;
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #6a00ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  width: 180px;
  z-index: 100;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--bg-primary);
  }
`;

const PageTitle = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    color: var(--text-primary);
  }
  
  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
`;

const SortDropdown = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;
  color: #666;
  cursor: pointer;
  outline: none;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CardRow = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  flex: 1;
  min-width: 250px;
  position: relative;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const CardHeader = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: ${props => props.color || 'var(--text-primary)'};
`;

const ChartContainer = styled.div`
  height: 120px;
  margin-top: 1rem;
`;

const StatButton = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.1);
  }
  
  &::before {
    content: '📊';
    font-size: 14px;
    opacity: 0.8;
  }
`;

// Thêm Modal và các components liên quan
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1.25rem;
  width: 85%;
  max-width: 1000px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--card-shadow);
  padding: 1.75rem;
  transform: translateY(20px);
  animation: slideUp 0.3s forwards;
  transition: background-color 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0.8; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-primary);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #b8b8b8;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--highlight-color);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
  
  &:first-child {
    border-top-left-radius: 0.5rem;
  }
  
  &:last-child {
    border-top-right-radius: 0.5rem;
  }
`;

const TableRow = styled.tr`
  &:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-primary)'};
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const PageInfo = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const PageButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? '#6a00ff' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid ${props => props.active ? '#6a00ff' : '#ddd'};
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover {
    background-color: ${props => props.active ? '#6a00ff' : '#f5f5f5'};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #6a00ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ff3e3e;
`;

// Card and list view component styles
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DataCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border-top: 4px solid 
    ${props => {
      switch(props.type) {
        case 'student': return '#ff2e8e'; 
        case 'lecturer': return '#f5a623';
        case 'exam': return '#6a00ff';
        case 'class': return '#00c16e';
        default: return 'var(--highlight-color)';
      }
    }};
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const CardInfo = styled.div`
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  
  strong {
    color: var(--text-primary);
    margin-right: 0.5rem;
  }
`;

const CardActions = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  background-color: ${props => props.primary ? 'var(--highlight-color)' : 'var(--bg-secondary)'};
  color: ${props => props.primary ? 'white' : 'var(--highlight-color)'};
  border: 1px solid var(--highlight-color);
  border-radius: 4px;
  padding: ${props => props.size === 'small' ? '0.25rem 0.5rem' : '0.5rem 1rem'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#5000cc' : 'rgba(106, 0, 255, 0.1)'};
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch(props.status?.toLowerCase()) {
      case 'ongoing': return '#fff2cc';
      case 'completed': return '#d4f7e7';
      case 'scheduled': return '#e8e5ff';
      default: return '#f1f1f1';
    }
  }};
  color: ${props => {
    switch(props.status?.toLowerCase()) {
      case 'ongoing': return '#f5a623';
      case 'completed': return '#00c16e';
      case 'scheduled': return '#6a00ff';
      default: return '#888';
    }
  }};
`;

// Skeleton loading components
const SkeletonCard = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  animation: pulse 1.5s infinite ease-in-out;
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

const SkeletonLine = styled.div`
  height: 12px;
  width: ${props => props.width || '100%'};
  background-color: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 0.75rem;
`;

// Tab components for filtering
const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 0;
    display: none;
  }
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: ${props => props.active ? 'var(--highlight-color)' : 'var(--text-secondary)'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  cursor: pointer;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.active ? 'var(--highlight-color)' : 'transparent'};
  }
  
  &:hover {
    color: var(--highlight-color);
  }
`;

// View toggle components
const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
`;

const ViewToggleButton = styled.button`
  background-color: ${props => props.active ? 'var(--highlight-color)' : 'var(--bg-secondary)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  span {
    margin-right: 0.25rem;
  }
  
  &:hover {
    background-color: ${props => props.active ? 'var(--highlight-color)' : 'var(--bg-primary)'};
  }
`;

// Search components
const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--highlight-color);
    box-shadow: 0 0 0 3px rgba(106, 0, 255, 0.1);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

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
        const classCountData = await dashboardService.getClassCount();
        const lecturerCountData = await dashboardService.getLecturerCount();
        const examCountData = await dashboardService.getExamCount();
        
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
    console.log('AdminDashboardPage: Initiating logout process');
    // Make sure the dropdowns are closed
    setShowDropdown(false);
    
    // Hiển thị modal xác nhận thay vì gọi logout trực tiếp
    setShowLogoutConfirmation(true);
  };
  
  const handleConfirmLogout = () => {
    console.log('AdminDashboardPage: Executing logout after confirmation');
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
            console.log('📊 Fetching student counts and teacher names for classes...');
            const classesWithStudentCountAndTeacher = await Promise.all(
              processedClasses.map(async (cls) => {
                try {
                  // Fetch student count
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  console.log(`Class ${cls.id} (${cls.name}): ${studentCount} students`);
                  
                  // Fetch teacher information using teacherId
                  let teacherName = 'Unknown Teacher';
                  if (cls.teacherId) {
                    try {
                      console.log(`🧑‍🏫 Fetching teacher info for ID: ${cls.teacherId}`);
                      const teacherResponse = await userService.getUserById(cls.teacherId);
                      if (teacherResponse && teacherResponse.data) {
                        const teacher = teacherResponse.data;
                        // Ghép firstName và lastName, fallback to username nếu không có
                        teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.username || 'Unknown Teacher';
                        console.log(`Teacher ${cls.teacherId}: ${teacherName}`);
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
            console.log('📊 Fetching student counts and teacher names for classes (array response)...');
            const classesWithStudentCountAndTeacher = await Promise.all(
              processedData.map(async (cls) => {
                try {
                  // Fetch student count
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  console.log(`Class ${cls.id} (${cls.name}): ${studentCount} students`);
                  
                  // Fetch teacher information using teacherId
                  let teacherName = 'Unknown Teacher';
                  if (cls.teacherId) {
                    try {
                      console.log(`🧑‍🏫 Fetching teacher info for ID: ${cls.teacherId}`);
                      const teacherResponse = await userService.getUserById(cls.teacherId);
                      if (teacherResponse && teacherResponse.data) {
                        const teacher = teacherResponse.data;
                        // Ghép firstName và lastName, fallback to username nếu không có
                        teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.username || 'Unknown Teacher';
                        console.log(`Teacher ${cls.teacherId}: ${teacherName}`);
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
            console.log('📊 Fetching student counts and teacher names for classes (page change)...');
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
            console.log('📊 Fetching student counts and teacher names for classes (page change - array)...');
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
        <CardsContainer>
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