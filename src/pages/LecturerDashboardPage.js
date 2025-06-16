import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import authService from '../services/authService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import examService from '../services/examService';
import classService from '../services/classService';

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

const ChartContainer = styled.div`
  height: 120px;
  margin-top: 1rem;
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  flex: 1;
  min-width: 280px;
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
  color: var(--text-primary);
`;

// Add these modal-related styled components
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

// Modal related components
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
        case 'exam': return '#6a00ff';
        case 'class': return '#ff2e8e';
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

// Tabs for filtering
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

function LecturerDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sortOption, setSortOption] = useState('recent');
  const [examCount, setExamCount] = useState(null);
  const [classCount, setClassCount] = useState(null);
  const [examChartData, setExamChartData] = useState([]);
  const [classChartData, setClassChartData] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);
  const dropdownRef = useRef(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  
  // Add new state variables for modal functionality
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode, setViewMode] = useState('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const pageSize = 10;

  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load exam count
        const examCountData = await dashboardService.getExamCount(user.id);
        setExamCount(examCountData);
        // console.log('Exam count data:', examCountData);
        
        const classCountData = await dashboardService.getClassCount(user.id);
        setClassCount(classCountData);
        // console.log('Class count data:', classCountData);

        // Load exam chart data
        const examChartResponse = await dashboardService.getExamChartData(user.id);
        if (examChartResponse && examChartResponse.data) {
          const examData = examChartResponse.data.map(item => ({
            name: item.month,
            count: item.count
          }));
          setExamChartData(examData);
          // console.log('Exam chart data:', examData);
        }

        // Load class chart data
        const classChartResponse = await dashboardService.getClassChartData(user.id);
        if (classChartResponse && classChartResponse.data) {
          const classData = classChartResponse.data.map(item => ({
            name: item.month,
            count: item.count
          }));
          setClassChartData(classData);
          // console.log('Class chart data:', classData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, []);
  
  useEffect(() => {
    if (user) {
      // Check 2FA status using authService
      const is2FAEnabled = authService.is2FAEnabled();
      setTwoFactorEnabled(is2FAEnabled);
      console.log('2FA status initialized:', is2FAEnabled);
    }
  }, [user]);
  
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
  
  const examData = [
    { name: 'Jan', count: 4 },
    { name: 'Feb', count: 2 },
    { name: 'Mar', count: 5 },
    { name: 'Apr', count: 3 },
    { name: 'May', count: 6 },
    { name: 'Jun', count: 8 },
    { name: 'Jul', count: 7 },
    { name: 'Aug', count: examCount || 4 }
  ];
  
  const classData = [
    { name: 'Jan', count: 2 },
    { name: 'Feb', count: 3 },
    { name: 'Mar', count: 3 },
    { name: 'Apr', count: 4 },
    { name: 'May', count: 4 },
    { name: 'Jun', count: 5 },
    { name: 'Jul', count: 5 },
    { name: 'Aug', count: classCount || 5 }
  ];
  
  const handleLogout = () => {
    setShowLogoutConfirmation(true);
    setShowDropdown(false);
  };
  
  const handleConfirmLogout = () => {
    console.log('LecturerDashboardPage: Executing logout after confirmation');
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
      case 'settings': return '⚙️';
      case 'signout': return '🚪';
      default: return '•';
    }
  };

  const handle2FAToggle = async () => {
    if (!user || !user.id) {
      alert('User information not available');
      return;
    }
    
    try {
      setUpdating2FA(true);
      // Toggle the current state
      const newTwoFAState = !twoFactorEnabled;
      
      // Call the API to update 2FA using authService
      let response;
      if (newTwoFAState) {
        response = await authService.enable2FA();
        console.log('Enabling 2FA response:', response);
      } else {
        response = await authService.disable2FA();
        console.log('Disabling 2FA response:', response);
      }
      
      // Update the local state
      setTwoFactorEnabled(newTwoFAState);
      
      // Display success message
      alert(`Two-factor authentication has been ${newTwoFAState ? 'enabled' : 'disabled'}`);
      
      // Close the dropdown
      setShowDropdown(false);
    } catch (error) {
      console.error('Error updating 2FA:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to update two-factor authentication'}`);
    } finally {
      setUpdating2FA(false);
    }
  };
  
  const goToSettings = () => {
    navigate('/settings');
    setShowDropdown(false);
  };

  // Add functions for modal operations
  // Function to handle opening modal and loading data
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
        case 'exams':
          setModalTitle('My Exams List');
          // If user is a lecturer, fetch exams for this lecturer
          if (user && user.id) {
            response = await examService.getAllExamsByLecturer(user.id, currentPage, pageSize);
          }
          break;
        case 'classes':
          setModalTitle('My Classes List');
          // If user is a lecturer, fetch classes for this lecturer
          if (user && user.id) {
            response = await classService.getClassesByTeacher(user.id, currentPage, pageSize);
          }
          break;
        default:
          setError('Invalid data type');
          setLoading(false);
          return;
      }
      
      // Process response data
      if (response && response.data) {
        const responseData = response.data;
        
        // Check if paginated data
        if (responseData.content) {
          let processedData = responseData.content;
          
          // If classes, fetch student count for each class
          if (type === 'classes') {
            console.log('📊 Fetching student counts for lecturer classes...');
            const classesWithStudentCount = await Promise.all(
              processedData.map(async (cls) => {
                try {
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  console.log(`Class ${cls.id} (${cls.name}): ${studentCount} students`);
                  
                  return {
                    ...cls,
                    studentCount: studentCount,
                    // For lecturer dashboard, teacher name should be the current user
                    teacherName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Current User'
                  };
                } catch (error) {
                  console.error(`Error fetching student count for class ${cls.id}:`, error);
                  return {
                    ...cls,
                    studentCount: 0,
                    teacherName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Current User'
                  };
                }
              })
            );
            processedData = classesWithStudentCount;
          }
          
          setModalData(processedData);
          setTotalPages(responseData.totalPages || 1);
          setTotalElements(responseData.totalElements || processedData.length);
        } else if (Array.isArray(responseData)) {
          // If simple array
          let processedData = responseData;
          
          // If classes, fetch student count for each class
          if (type === 'classes') {
            console.log('📊 Fetching student counts for lecturer classes (array response)...');
            const classesWithStudentCount = await Promise.all(
              processedData.map(async (cls) => {
                try {
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  console.log(`Class ${cls.id} (${cls.name}): ${studentCount} students`);
                  
                  return {
                    ...cls,
                    studentCount: studentCount,
                    teacherName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Current User'
                  };
                } catch (error) {
                  console.error(`Error fetching student count for class ${cls.id}:`, error);
                  return {
                    ...cls,
                    studentCount: 0,
                    teacherName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Current User'
                  };
                }
              })
            );
            processedData = classesWithStudentCount;
          }
          
          setModalData(processedData);
          setTotalPages(1);
          setTotalElements(processedData.length);
        } else {
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
  
  // Function to handle page changes
  const handlePageChange = async (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    
    setCurrentPage(newPage);
    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch(modalType) {
        case 'exams':
          if (user && user.id) {
            response = await examService.getExamsByTeacher(user.id, newPage, pageSize);
          }
          break;
        case 'classes':
          if (user && user.id) {
            response = await classService.getClassesByTeacher(user.id, newPage, pageSize);
          }
          break;
        default:
          setError('Invalid data type');
          setLoading(false);
          return;
      }
      
      if (response && response.data) {
        const responseData = response.data;
        
        if (responseData.content) {
          let processedData = responseData.content;
          
          // If classes, fetch student count for each class
          if (modalType === 'classes') {
            console.log('📊 Fetching student counts for lecturer classes (page change)...');
            const classesWithStudentCount = await Promise.all(
              processedData.map(async (cls) => {
                try {
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  console.log(`Class ${cls.id} (${cls.name}): ${studentCount} students`);
                  
                  return {
                    ...cls,
                    studentCount: studentCount,
                    teacherName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Current User'
                  };
                } catch (error) {
                  console.error(`Error fetching student count for class ${cls.id}:`, error);
                  return {
                    ...cls,
                    studentCount: 0,
                    teacherName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Current User'
                  };
                }
              })
            );
            processedData = classesWithStudentCount;
          }
          
          setModalData(processedData);
          setTotalPages(responseData.totalPages || 1);
          setTotalElements(responseData.totalElements || processedData.length);
        } else if (Array.isArray(responseData)) {
          let processedData = responseData;
          
          // If classes, fetch student count for each class
          if (modalType === 'classes') {
            console.log('📊 Fetching student counts for lecturer classes (page change - array)...');
            const classesWithStudentCount = await Promise.all(
              processedData.map(async (cls) => {
                try {
                  const studentCountResponse = await classService.getStudentCountForClass(cls.id);
                  const studentCount = studentCountResponse.data || 0;
                  
                  return {
                    ...cls,
                    studentCount: studentCount,
                    teacherName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Current User'
                  };
                } catch (error) {
                  console.error(`Error fetching student count for class ${cls.id}:`, error);
                  return {
                    ...cls,
                    studentCount: 0,
                    teacherName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Current User'
                  };
                }
              })
            );
            processedData = classesWithStudentCount;
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
  
  // Function to filter data based on search query
  const getFilteredData = () => {
    if (!searchQuery.trim()) return modalData;
    
    return modalData.filter(item => {
      switch(modalType) {
        case 'exams':
          return (
            (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.className && item.className.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        case 'classes':
          return (
            (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        default:
          return false;
      }
    });
  };
  
  // Function to filter based on active tab
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
  
  // Function to render table headers
  const renderTableHeader = () => {
    switch(modalType) {
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
  
  // Function to render table content
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
  
  // Function to render data cards
  const renderDataCards = () => {
    const filteredData = getFilteredByTab(getFilteredData());
    
    if (loading) {
      return Array(4).fill(0).map((_, i) => (
        <DataCard key={i} type={modalType === 'exams' ? 'exam' : 'class'}>
          <CardHeader>Loading...</CardHeader>
        </DataCard>
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
              <ActionButton size="small" onClick={() => navigate(`/edit-exam/${exam.id}`)}>View Details</ActionButton>
            </CardActions>
          </DataCard>
        ));
        
      case 'classes':
        return filteredData.map(cls => (
          <DataCard key={cls.id} type="class">
            <CardHeader>{cls.name}</CardHeader>
            <CardInfo><strong>Description:</strong> {cls.description || '-'}</CardInfo>
            <CardInfo><strong>Students:</strong> {cls.studentCount || 0}</CardInfo>
            <CardActions>
              <ActionButton size="small" onClick={() => navigate(`/exams?classId=${cls.id}`)}>View Class</ActionButton>
            </CardActions>
          </DataCard>
        ));
        
      default:
        return (
          <div style={{ gridColumn: '1 / -1' }}>Invalid data type</div>
        );
    }
  };

  return (
    <>
      <ThemeStyles />
      <DashboardContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        <Sidebar theme={theme}>
          <Logo>logo</Logo>
          <SidebarMenu>
            <NavItem to="/lecturer-dashboard" className="active">
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
              <h1>Lecturer Dashboard</h1>
              <p>Welcome back, {getFullName()}</p>
            </PageTitle>
            
            <HeaderRight>
              <ThemeToggle />
              <NotificationIcon />
              <DropdownContainer ref={dropdownRef}>
                <UserAvatar onClick={toggleDropdown}>{getUserInitial()}</UserAvatar>
                {showDropdown && (
                  <Dropdown>
                    <DropdownItem onClick={goToSettings}>
                      <span>👤</span> Profile
                    </DropdownItem>
                    <DropdownItem onClick={goToSettings}>
                      <span>⚙️</span> Settings
                    </DropdownItem>
                    <DropdownItem onClick={handle2FAToggle} disabled={updating2FA}>
                      <span>{twoFactorEnabled ? '🔒' : '🔓'}</span> 
                      {updating2FA ? 'Updating...' : (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                    </DropdownItem>
                    <DropdownItem onClick={handleLogout}>
                      <span>🚪</span> Sign out
                    </DropdownItem>
                  </Dropdown>
                )}
              </DropdownContainer>
            </HeaderRight>
          </Header>
          
          <CardsContainer>
            <Card>
              <CardHeader>My Exams</CardHeader>
              <CardValue>{loading ? 'Loading...' : examCount ?? 0}</CardValue>
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
              <CardHeader>My Classes</CardHeader>
              <CardValue>{loading ? 'Loading...' : classCount ?? 0}</CardValue>
              <StatButton onClick={() => handleOpenModal('classes')} />
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff2e8e" stopOpacity={1} />
                        <stop offset="100%" stopColor="#ff2e8e" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip cursor={false} />
                    <Bar dataKey="count" fill="url(#colorClasses)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          </CardsContainer>
        </MainContent>
        
        {/* Add the modal component */}
        {modalOpen && (
          <ModalOverlay>
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
          </ModalOverlay>
        )}
        
        <ConfirmationModal
          isOpen={showLogoutConfirmation}
          onClose={() => setShowLogoutConfirmation(false)}
          onConfirm={handleConfirmLogout}
          message="Are you sure you want to logout?"
        />
      </DashboardContainer>
    </>
  );
}

export default LecturerDashboardPage; 