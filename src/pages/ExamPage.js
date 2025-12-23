import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import examService from '../services/examService';
import classService from '../services/classService';
import questionService from '../services/questionService';
import studentExamService from '../services/studentExamService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
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
} from '../components/dashboard/DashboardStyles';
import { SPACING_SCALE, RADIUS_SCALE, TYPOGRAPHY_SCALE } from '../theme/tokens';
import { SEMANTIC } from '../theme/colors';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AppRegistrationOutlinedIcon from '@mui/icons-material/AppRegistrationOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';

// Styled Components
const ToolbarMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING_SCALE.sm};
  color: var(--text-secondary);
  font-size: ${TYPOGRAPHY_SCALE.sm};
  flex-wrap: wrap;
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING_SCALE.xs};
  padding: ${SPACING_SCALE.xs};
  border-radius: var(--radius-sm, ${RADIUS_SCALE.sm});
  border: 1px solid transparent;
  background-color: transparent;
  color: #1976d2;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: rgba(25, 118, 210, 0.1);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const CreateButton = styled.button`
  background: linear-gradient(120deg, #4A4AFF, #6A7EFC);
  color: white;
  border: none;
  border-radius: var(--radius-pill, ${RADIUS_SCALE.pill});
  padding: ${SPACING_SCALE.xs} ${SPACING_SCALE.lg};
  font-size: ${TYPOGRAPHY_SCALE.sm};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: ${SPACING_SCALE.xs};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 12px 24px rgba(74, 74, 255, 0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 32px rgba(74, 74, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ClassSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING_SCALE.sm};
  margin: 0 auto ${SPACING_SCALE.md};
  flex-wrap: nowrap;
  width: 100%;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CompactSortDropdown = styled(SortDropdown)`
  min-width: 180px;
  width: clamp(180px, 22vw, 240px);
  flex: 0 0 auto;
`;

const SelectorLabel = styled.label`
  font-size: ${TYPOGRAPHY_SCALE.sm};
  color: var(--text-secondary);
  white-space: nowrap;
`;

const InfoMessage = styled.p`
  font-size: ${TYPOGRAPHY_SCALE.sm};
  color: var(--text-secondary);
  margin-bottom: ${SPACING_SCALE.md};
`;

const ErrorMessage = styled(InfoMessage)`
  color: ${SEMANTIC?.error?.main || '#D14343'};
  font-weight: 600;
`;

const ClickHint = styled.span`
  display: block;
  font-size: 0.7rem;
  color: #1976d2;
  margin-top: 0.25rem;
  font-weight: 600;
`;

const TableCard = styled.section`
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg, ${RADIUS_SCALE.lg});
  padding: ${SPACING_SCALE.lg};
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: ${SPACING_SCALE.md};
`;

const ResponsiveTable = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const ExamTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 720px;
  table-layout: fixed;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${SPACING_SCALE.sm} ${SPACING_SCALE.md};
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: ${TYPOGRAPHY_SCALE.sm};
  font-weight: 600;
  white-space: nowrap;

  &.numeric {
    text-align: center;
  }
`;

const TableRow = styled.tr`
  background-color: ${({ $highlight }) => ($highlight ? 'rgba(106, 126, 252, 0.08)' : 'transparent')};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:last-child td {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${({ $highlight }) => ($highlight ? 'rgba(106, 126, 252, 0.16)' : 'var(--hover-bg)')};
  }
`;

const TableCell = styled.td`
  padding: ${SPACING_SCALE.sm} ${SPACING_SCALE.md};
  color: var(--text-primary);
  font-size: ${TYPOGRAPHY_SCALE.sm};
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  text-align: left;

  &.numeric {
    text-align: center;
  }
`;

const IndexCell = styled(TableCell)`
  color: var(--text-secondary);
  text-align: center;
`;

const ActionCell = styled.td`
  padding: ${SPACING_SCALE.sm};
  display: flex;
  gap: ${SPACING_SCALE.xs};
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
`;

const IconActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-round, ${RADIUS_SCALE.round});
  border: 1px solid rgba(106, 126, 252, 0.3);
  background-color: rgba(106, 126, 252, 0.08);
  color: #6a7efc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: rgba(106, 126, 252, 0.16);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(106, 126, 252, 0.5);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  padding: ${SPACING_SCALE.xl};
  text-align: center;
  color: var(--text-secondary);
  font-size: ${TYPOGRAPHY_SCALE.sm};
`;

const STATUS_VARIANTS = {
  IN_PROGRESS: {
    bg: 'rgba(237, 108, 2, 0.12)',
    color: SEMANTIC?.warning?.main || '#ED6C02',
  },
  COMPLETED: {
    bg: 'rgba(46, 125, 50, 0.12)',
    color: SEMANTIC?.success?.main || '#2E7D32',
  },
  NOT_STARTED: {
    bg: 'rgba(86, 98, 116, 0.12)',
    color: '#566274',
  },
  SCHEDULED: {
    bg: 'rgba(2, 136, 209, 0.12)',
    color: SEMANTIC?.info?.main || '#0288D1',
  },
  default: {
    bg: 'rgba(86, 98, 116, 0.12)',
    color: '#566274',
  },
};

const getStatusToken = (variant = 'default') =>
  STATUS_VARIANTS[variant] || STATUS_VARIANTS.default;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-pill, ${RADIUS_SCALE.pill});
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${({ $variant }) => getStatusToken($variant).bg};
  color: ${({ $variant }) => getStatusToken($variant).color};
`;

const ExpiryTime = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ $expired }) => ($expired === 'true' ? SEMANTIC?.error?.main || '#D14343' : 'inherit')};
  font-weight: ${({ $expired }) => ($expired === 'true' ? 600 : 500)};
`;


// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${SPACING_SCALE.md};
`;

const ModalContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg, ${RADIUS_SCALE.lg});
  width: min(800px, 95%);
  max-height: 80vh;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.header`
  padding: ${SPACING_SCALE.md};
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${SPACING_SCALE.sm};
`;

const ModalTitle = styled.h2`
  color: var(--text-primary);
  font-size: ${TYPOGRAPHY_SCALE.md};
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: rgba(106, 126, 252, 0.1);
  border: none;
  border-radius: var(--radius-round, ${RADIUS_SCALE.round});
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6a7efc;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(106, 126, 252, 0.2);
  }
`;

const ModalContent = styled.div`
  padding: ${SPACING_SCALE.md};
  overflow-y: auto;
`;

const StudentExamCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, ${RADIUS_SCALE.md});
  padding: ${SPACING_SCALE.md};
  margin-bottom: ${SPACING_SCALE.sm};
  background-color: var(--bg-primary);
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
  user-select: none;
  
  &:hover {
    transform: translateY(-2px);
    border-color: #6a7efc;
  }
`;

const StudentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING_SCALE.xs};
  gap: ${SPACING_SCALE.sm};
`;

const StudentName = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

const ExamStatus = styled(StatusBadge).attrs(({ status }) => ({
  $variant: status || 'default',
}))`
  font-size: 0.75rem;
`;

const ExamDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${SPACING_SCALE.sm};
  font-size: ${TYPOGRAPHY_SCALE.sm};
  color: var(--text-secondary);
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${SPACING_SCALE.xs};
`;

const DetailLabel = styled.span`
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: var(--text-primary);
  font-weight: 600;
`;

const ModalEmptyState = styled.div`
  text-align: center;
  padding: ${SPACING_SCALE.lg};
  color: var(--text-secondary);
  font-size: ${TYPOGRAPHY_SCALE.sm};
`;

const ModalMetaText = styled.p`
  margin-bottom: ${SPACING_SCALE.sm};
  color: var(--text-secondary);
  font-size: ${TYPOGRAPHY_SCALE.sm};
`;

const SectionHeading = styled.h3`
  color: var(--text-primary);
  margin: ${SPACING_SCALE.md} 0 ${SPACING_SCALE.sm};
`;

function ExamPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const dropdownRef = useRef(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  
  // Student exam modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedExamForStudents, setSelectedExamForStudents] = useState(null);
  const [studentExams, setStudentExams] = useState([]);
  const [studentExamsLoading, setStudentExamsLoading] = useState(false);
  const [selectedStudentExam, setSelectedStudentExam] = useState(null);
  const [studentExamDetail, setStudentExamDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Add a useEffect to handle URL query parameters
  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const classIdParam = params.get('classId');
    
    if (classIdParam) {
      // Convert to number since IDs from the server are numeric
      const classId = parseInt(classIdParam, 10);
      
      // Set the selected class ID if it's a valid number
      if (!isNaN(classId) && classId > 0) {
        setSelectedClassId(classId);
        // Update the page title to include the class name
        if (classes.length > 0) {
          const selectedClass = classes.find(cls => cls.id === classId);
          if (selectedClass) {
            document.title = `Exams - ${selectedClass.name}`;
          }
        }
      }
    }
  }, [location.search, classes]);
  
  // Update the useEffect that fetches classes to avoid overriding the URL parameter
  useEffect(() => {
    if (user) {
      setClassesLoading(true);
      let fetchClassesPromise;
      
      if (user.role === 'ROLE_LECTURER') {
        // Fetch classes taught by this lecturer
        fetchClassesPromise = classService.getClassesByTeacher(user.id);
      } else if (user.role === 'ROLE_ADMIN') {
        // Admins can see all classes
        fetchClassesPromise = classService.getAllClasses();
      } else if (user.role === 'ROLE_STUDENT') {
        // For students, we'd fetch classes they're enrolled in
        fetchClassesPromise = classService.getStudentClasses(user.id);
      }
      
      if (fetchClassesPromise) {
        fetchClassesPromise
          .then(response => {
            const fetchedClasses = response.data.content || response.data;
            setClasses(fetchedClasses);
            
            // Only set default selection if there's no classId in the URL and no selected ID yet
            const params = new URLSearchParams(location.search);
            const classIdParam = params.get('classId');
            
            if (!classIdParam && fetchedClasses.length > 0 && !selectedClassId) {
              // Set the first class as selected by default
              setSelectedClassId(fetchedClasses[0].id);
            }
          })
          .catch(err => {
            console.error('Error fetching classes:', err);
            setError('Failed to load classes. Please try again later.');
            setClasses([]);
          })
          .finally(() => {
            setClassesLoading(false);
          });
      }
    }
  }, [user, location.search]);
  
  // Fetch exams when selectedClassId changes
  useEffect(() => {
    if (selectedClassId) {
      fetchExams(selectedClassId);
    } else {
      // Clear exams if no class is selected
      setExams([]);
      setLoading(false);
    }
  }, [selectedClassId, currentPage, pageSize]);
  
  const fetchExams = async (classId) => {
    setLoading(true);
    setError(null);
    setLastRefreshTime(new Date());
    
    if (!classId) {
      console.error('fetchExams: No classId provided');
      setError('No class selected. Please select a class to view exams.');
      setExams([]);
      setLoading(false);
      return;
    }
    
    // Convert to number if it's not already
    const numericClassId = typeof classId === 'number' ? classId : parseInt(classId, 10);
    
    if (isNaN(numericClassId) || numericClassId <= 0) {
      console.error('fetchExams: Invalid classId format:', classId);
      setError('Invalid class ID. Please select a valid class.');
      setExams([]);
      setLoading(false);
      return;
    }
    
    try {
      const response = await examService.getExamsByClass(numericClassId, currentPage, pageSize);
      
      // Log the entire response for debugging
      
      // Process exam data with better handling for different response formats
      let fetchedExams = [];
      
      if (response.data && response.data.content) {
        // Paginated response
        fetchedExams = response.data.content;
      } else if (Array.isArray(response.data)) {
        // Array response
        fetchedExams = response.data;
      } else if (response.data) {
        // Unknown format but has data
        console.warn('Unexpected response format, attempting to process anyway');
        fetchedExams = Array.isArray(response.data) ? response.data : [response.data];
      }
      
      if (!fetchedExams || fetchedExams.length === 0) {
        setExams([]);
        setLoading(false);
        return;
      }
      
      // Log the first exam for debugging
      if (fetchedExams.length > 0) {
      }
      
      // Get question counts for all exams
      const examsWithQuestionPromises = fetchedExams.map(async (exam) => {
        // Debug the raw exam object
        
        // Calculate time remaining until exam end time
        let timeRemains = '00:00:00';
        
        // Ensure exam exists and has expected properties
        if (!exam) {
          console.warn('Null or undefined exam object in response');
          return null;
        }
        
        if (exam.endAt) {
          try {
            const endTime = new Date(exam.endAt);
            const now = new Date();
            const diff = endTime - now;
            
            if (!isNaN(diff) && diff > 0) {
              // Format as hh:mm:ss
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((diff % (1000 * 60)) / 1000);
              
              timeRemains = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
          } catch (error) {
            console.error('Error calculating time remaining:', error);
          }
        }
        
        // Log all available properties in the exam object
        
        // Log specific title values
        
        // Fetch question count for this exam
        const questionCount = await examService.getQuestionCount(exam.id);
        
        // Create formatted exam with both title and name properties
        return {
          id: typeof exam.id === 'number' ? exam.id : 0,
          title: exam.title || `Exam ${exam.id || 0}`,
          name: exam.title || `Exam ${exam.id || 0}`, // Keep name for backwards compatibility
          value: typeof exam.value === 'number' ? exam.value : 100,
          questions: questionCount, // Use the actual question count from API
          timeRemains: timeRemains,
          status: (exam.status && typeof exam.status === 'string') ? exam.status : 'SCHEDULED'
        };
      });
      
      // Wait for all question count requests to complete
      const formattedExams = (await Promise.all(examsWithQuestionPromises)).filter(Boolean); // Remove any null entries
      
      setExams(formattedExams);
    } catch (err) {
      console.error('Error fetching exams:', err);
      
      // More detailed error handling
      if (err.response) {
        // Server responded with an error status
        console.error('Server error status:', err.response.status);
        console.error('Server error data:', err.response.data);
        
        if (err.response.status === 401) {
          setError('Authentication error. Please log in again.');
        } else if (err.response.status === 403) {
          setError('You do not have permission to view these exams.');
        } else {
          setError(`Failed to load exams (${err.response.status}). Please try again later.`);
        }
      } else if (err.request) {
        // Request was made but no response received (network error)
        console.error('Network error - no response received');
        setError('Network error. Please check your connection and try again.');
      } else {
        // Error in setting up the request
        console.error('Error setting up request:', err.message);
        setError('Failed to load exams. Please try again later.');
      }
      
      setExams([]);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const handleLogout = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    setShowLogoutConfirmation(true);
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

  const menuIconMap = {
    dashboard: <SpaceDashboardOutlinedIcon fontSize="small" />,
    exams: <QuizOutlinedIcon fontSize="small" />,
    class: <ClassOutlinedIcon fontSize="small" />,
    reports: <AssessmentOutlinedIcon fontSize="small" />,
    payment: <CreditCardOutlinedIcon fontSize="small" />,
    users: <GroupOutlinedIcon fontSize="small" />,
    settings: <SettingsOutlinedIcon fontSize="small" />,
    signout: <LogoutOutlinedIcon fontSize="small" />,
    myClasses: <MenuBookOutlinedIcon fontSize="small" />,
    register: <AppRegistrationOutlinedIcon fontSize="small" />,
    results: <BarChartOutlinedIcon fontSize="small" />,
    assistant: <SmartToyOutlinedIcon fontSize="small" />,
  };

  const getMenuIcon = (name) => menuIconMap[name] || <CircleOutlinedIcon fontSize="small" />;

  // Determine user role
  const isStudent = user && user.role === 'ROLE_STUDENT';
  const isLecturer = user && user.role === 'ROLE_LECTURER';
  const isAdmin = user && user.role === 'ROLE_ADMIN';
  const showActionsColumn = isLecturer || isAdmin;

  // Check if time is expired (red color)
  const isExpired = (time) => {
    return time.startsWith('00:');
  };

  const handleCreateExam = () => {
    // Redirect to exam creation page
    navigate('/create-exam');
  };
  
  const handleEditExam = (examId) => {
    // Redirect to exam edit page
    navigate(`/edit-exam/${examId}`);
  };
  
  const handleDeleteExam = async (examId) => {
    if (!examId || examId === 0) {
      console.error("Cannot delete exam with invalid ID:", examId);
      alert("Cannot delete exam with invalid ID");
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        setLoading(true);
        const response = await examService.deleteExam(examId);
        alert('Exam deleted successfully');
        
        // Refresh the exam list
        if (selectedClassId) {
          fetchExams(selectedClassId);
        }
      } catch (err) {
        console.error('Error deleting exam:', err);
        let errorMessage = 'Failed to delete exam. Please try again.';
        
        if (err.response) {
          console.error('Status:', err.response.status);
          console.error('Error data:', err.response.data);
          
          if (err.response.status === 401) {
            errorMessage = 'Authentication error. Please log in again.';
          } else if (err.response.status === 403) {
            errorMessage = 'You do not have permission to delete this exam.';
          } else if (err.response.data && err.response.data.message) {
            errorMessage = `Error: ${err.response.data.message}`;
          }
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to format status for display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Validate that status is a string before processing
    if (typeof status !== 'string') {
      console.warn('Invalid status format:', status);
      return 'Unknown';
    }
    
    // Convert from SCREAMING_SNAKE_CASE to Title Case
    return status.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Add this debug function to the component
  const debugExamData = (exam) => {
    return exam;
  };

  // Function to check if a route is active
  const isRouteActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Add a function to refresh exams without changing the selected class
  const refreshExams = () => {
    if (selectedClassId) {
      fetchExams(selectedClassId);
      setLastRefresh(new Date());
    }
  };

  // Add a toggle function for the auto-refresh feature
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  // Set up and clean up the refresh interval
  useEffect(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // If auto-refresh is enabled, set up the new interval
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        refreshExams();
      }, 60000); // Refresh every minute
      
    }
    
    // Clean up on component unmount or when autoRefresh changes
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, selectedClassId]);

  // Function to handle viewing student exams for a specific exam
  const handleViewStudents = async (exam) => {
    if (!exam || !exam.id) {
      console.error('handleViewStudents: Invalid exam object');
      return;
    }

    setSelectedExamForStudents(exam);
    setShowStudentModal(true);
    setStudentExamsLoading(true);
    setStudentExams([]);

    try {
      const response = await studentExamService.getStudentExamsByExamId(exam.id);
      
      // Process the response data
      const fetchedStudentExams = Array.isArray(response.data) ? response.data : [];
      
      // Format the data for display
      const formattedStudentExams = fetchedStudentExams.map((studentExam, index) => {
        return {
          id: studentExam.studentExamId, // API trả về studentExamId, không phải id
          studentId: studentExam.studentId,
          studentName: studentExam.studentName || `Student ${studentExam.studentId}`,
          status: studentExam.status || 'NOT_STARTED',
          score: studentExam.score || 0,
          startTime: studentExam.startAt, // API trả về startAt, không phải startTime
          endTime: studentExam.finishAt, // API trả về finishAt, không phải endTime
          currentQuestion: studentExam.currentQuestion || 0,
          switchTabCount: studentExam.switchTabCount || 0
        };
      });

      setStudentExams(formattedStudentExams);

    } catch (error) {
      console.error('Error fetching student exams:', error);
      
      let errorMessage = 'Failed to load student exam data.';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to view student exam data.';
        } else if (error.response.status === 404) {
          errorMessage = 'No student exam data found for this exam.';
        }
      }
      
      // Show empty state with error message
      setStudentExams([]);
      alert(errorMessage);
      
    } finally {
      setStudentExamsLoading(false);
    }
  };

  // Function to handle viewing detailed student exam information
  const handleViewStudentDetail = async (studentExam) => {
    
    if (!studentExam || !studentExam.id) {
      console.error('handleViewStudentDetail: Invalid studentExam object', studentExam);
      return;
    }

    setSelectedStudentExam(studentExam);
    setShowDetailModal(true);
    setStudentExamDetail(null);

    try {
      const response = await studentExamService.getStudentExamDetail(studentExam.id);
      
      setStudentExamDetail(response.data);

    } catch (error) {
      console.error('Error fetching student exam detail:', error);
      
      let errorMessage = 'Failed to load student exam details.';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to view detailed student exam data.';
        } else if (error.response.status === 404) {
          errorMessage = 'Student exam details not found.';
        }
      }
      
      alert(errorMessage);
      setShowDetailModal(false);
    }
  };

  // Function to close student modal
  const closeStudentModal = () => {
    setShowStudentModal(false);
    setSelectedExamForStudents(null);
    setStudentExams([]);
    setStudentExamsLoading(false);
  };

  // Function to close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedStudentExam(null);
    setStudentExamDetail(null);
  };

  // Function to format date/time for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Function to format status for display
  const formatExamStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <Logo>
          <span>EX</span>
          Exam Space
        </Logo>
        <SidebarMenu>
          {isStudent ? (
            <>
              <NavItem to="/student-dashboard" className={isRouteActive('/student-dashboard') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams" className={isRouteActive('/exams') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('exams')}</NavIcon>
                Exams
              </NavItem>
              <NavItem to="/results" className={isRouteActive('/results') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('results')}</NavIcon>
                Results
              </NavItem>
              <NavItem to="/ai-assistant" className={isRouteActive('/ai-assistant') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('assistant')}</NavIcon>
                AI Assistant
              </NavItem>
            </>
          ) : isLecturer ? (
            <>
              <NavItem to="/lecturer-dashboard" className={isRouteActive('/lecturer-dashboard') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams" className={isRouteActive('/exams') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('exams')}</NavIcon>
                Exams
              </NavItem>
              <NavItem to="/class" className={isRouteActive('/class') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('class')}</NavIcon>
                Class
              </NavItem>
              <NavItem to="/reports" className={isRouteActive('/reports') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('reports')}</NavIcon>
                Reports
              </NavItem>
              <NavItem to="/ai-assistant" className={isRouteActive('/ai-assistant') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('assistant')}</NavIcon>
                AI Assistant
              </NavItem>
            </>
          ) : (
            <>
              <NavItem to="/admin-dashboard" className={isRouteActive('/admin-dashboard') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams" className={isRouteActive('/exams') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('exams')}</NavIcon>
                Exams
              </NavItem>
              <NavItem to="/class" className={isRouteActive('/class') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('class')}</NavIcon>
                Class
              </NavItem>
              <NavItem to="/reports" className={isRouteActive('/reports') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('reports')}</NavIcon>
                Reports
              </NavItem>
            </>
          )}
        </SidebarMenu>
        <BottomMenu>
          <NavItem to="/settings" className={isRouteActive('/settings') ? 'active' : ''}>
            <NavIcon>{getMenuIcon('settings')}</NavIcon>
            Settings
          </NavItem>
          <NavItem to="#" onClick={handleLogout}>
            <NavIcon>{getMenuIcon('signout')}</NavIcon>
            Sign out
          </NavItem>
        </BottomMenu>
      </Sidebar>
      
      <MainContent>
        <Header>
          <PageTitle>
            <h1>Exams</h1>
            <p>Manage exam schedules and track progress in real-time.</p>
          </PageTitle>
          
          <HeaderRight>
            <ToolbarMeta>
              <span>Last updated {lastRefreshTime.toLocaleTimeString()}</span>
              <RefreshButton
                type="button"
                onClick={() => selectedClassId ? fetchExams(selectedClassId) : null}
                aria-label="Refresh exams"
                disabled={!selectedClassId}
              >
                <RefreshOutlinedIcon fontSize="small" />
                Refresh
              </RefreshButton>
            </ToolbarMeta>
            <ThemeToggle />
            {showActionsColumn && (
              <CreateButton type="button" onClick={handleCreateExam}>
                + Create Exam
              </CreateButton>
            )}
            <NotificationIcon type="button" aria-label="Notifications">
              <NotificationsNoneOutlinedIcon fontSize="small" />
            </NotificationIcon>
            <DropdownContainer ref={dropdownRef}>
              <UserAvatar type="button" onClick={toggleDropdown} aria-label="User menu">
                {getUserInitial()}
              </UserAvatar>
              {showDropdown && (
                <Dropdown>
                  <DropdownItem onClick={() => { setShowDropdown(false); navigate('/settings'); }}>
                    <SettingsOutlinedIcon fontSize="small" />
                    Settings
                  </DropdownItem>
                  <DropdownItem onClick={handleLogout}>
                    <LogoutOutlinedIcon fontSize="small" />
                    Sign out
                  </DropdownItem>
                </Dropdown>
              )}
            </DropdownContainer>
          </HeaderRight>
        </Header>
        
        {classesLoading ? (
          <InfoMessage>Loading classes...</InfoMessage>
        ) : classes.length > 0 ? (
          <ClassSelector>
            <SelectorLabel htmlFor="classSelect">Select class</SelectorLabel>
            <CompactSortDropdown 
              id="classSelect"
              value={selectedClassId || ''}
              onChange={(e) => {
                const newClassId = e.target.value ? parseInt(e.target.value, 10) : null;
                setSelectedClassId(newClassId);
              }}
            >
              <option value="">Choose your class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name || c.title || `Class ${c.id}`}
                </option>
              ))}
            </CompactSortDropdown>
          </ClassSelector>
        ) : (
          <InfoMessage>
            {error ? error : 'No classes available. '}
            {isLecturer && !error && 'Create a class to start scheduling exams.'}
          </InfoMessage>
        )}
        
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
        
        <TableCard>
          {!selectedClassId ? (
            <EmptyState>Please select a class to view exams.</EmptyState>
          ) : loading ? (
            <EmptyState>Loading exams...</EmptyState>
          ) : error ? (
            <ErrorMessage role="alert">{error}</ErrorMessage>
          ) : exams.length === 0 ? (
            <EmptyState>
              No exams available for this class.
              {isStudent && (
                <ClickHint>If you believe this is a mistake, please contact your instructor.</ClickHint>
              )}
            </EmptyState>
          ) : (
            <ResponsiveTable>
              <ExamTable>
                <colgroup>
                  <col style={{ width: '10%' }} />
                  <col style={{ width: showActionsColumn ? '30%' : '34%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: showActionsColumn ? '14%' : '18%' }} />
                  {showActionsColumn && <col style={{ width: '8%' }} />}
                </colgroup>
                <thead>
                  <tr>
                    <TableHeader className="numeric">ID</TableHeader>
                    <TableHeader>Exam</TableHeader>
                    <TableHeader className="numeric">Value</TableHeader>
                    <TableHeader className="numeric">Questions</TableHeader>
                    <TableHeader className="numeric">Time left</TableHeader>
                    <TableHeader>Status</TableHeader>
                    {showActionsColumn && <TableHeader>Actions</TableHeader>}
                  </tr>
                </thead>
                <tbody>
                  {exams.map(exam => {
                    const currentExam = debugExamData(exam);
                    const highlightRow = isStudent && currentExam.status === 'ONGOING';
                    return (
                      <TableRow 
                        key={currentExam.id || `exam-${Math.random()}`}
                        $highlight={highlightRow}
                        $clickable={highlightRow}
                        onClick={() => {
                          if (highlightRow) {
                            const studentExamId = `${user.id}-${currentExam.id}`;
                            localStorage.setItem('currentStudentExamId', studentExamId);
                            navigate(`/start-exam/${currentExam.id}`);
                          }
                        }}
                      >
                        <IndexCell>{currentExam.id || 0}</IndexCell>
                        <TableCell>{currentExam.title || currentExam.name || `Exam ${currentExam.id || 0}`}</TableCell>
                        <TableCell className="numeric">{currentExam.value || 100}</TableCell>
                        <TableCell className="numeric">
                          {typeof currentExam.questions === 'number'
                            ? currentExam.questions
                            : Array.isArray(currentExam.questions)
                              ? currentExam.questions.length
                              : 0}
                        </TableCell>
                        <TableCell className="numeric">
                          <ExpiryTime $expired={isExpired(currentExam.timeRemains || '00:00:00') ? 'true' : 'false'}>
                            {currentExam.timeRemains || '00:00:00'}
                          </ExpiryTime>
                        </TableCell>
                        <TableCell>
                          <StatusBadge $variant={currentExam.status || 'SCHEDULED'}>
                            {formatStatus(currentExam.status || 'SCHEDULED')}
                          </StatusBadge>
                          {highlightRow && <ClickHint>Click to take exam</ClickHint>}
                        </TableCell>
                        {showActionsColumn && (
                          <ActionCell>
                            <IconActionButton
                              type="button"
                              title="View students"
                              onClick={() => handleViewStudents(currentExam)}
                            >
                              <PeopleAltOutlinedIcon fontSize="small" />
                            </IconActionButton>
                            <IconActionButton
                              type="button"
                              title="Edit exam"
                              onClick={() => handleEditExam(currentExam.id)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconActionButton>
                            <IconActionButton
                              type="button"
                              title="Delete exam"
                              onClick={() => handleDeleteExam(currentExam.id)}
                              disabled={loading}
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconActionButton>
                          </ActionCell>
                        )}
                      </TableRow>
                    );
                  })}
                </tbody>
              </ExamTable>
            </ResponsiveTable>
          )}
        </TableCard>
      </MainContent>
      
      {/* Add logout confirmation modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleConfirmLogout}
        message="Are you sure you want to logout?"
      />

      {/* Student Exam Modal */}
      {showStudentModal && (
        <ModalOverlay onClick={closeStudentModal}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                Student Exams - {selectedExamForStudents?.title || 'Exam'}
              </ModalTitle>
              <CloseButton onClick={closeStudentModal}>×</CloseButton>
            </ModalHeader>
            <ModalContent>
              {studentExamsLoading ? (
                <ModalEmptyState>Loading student exams...</ModalEmptyState>
              ) : studentExams.length === 0 ? (
                <ModalEmptyState>No students have taken this exam yet.</ModalEmptyState>
              ) : (
                <>
                  <ModalMetaText>
                    {studentExams.length} student{studentExams.length !== 1 ? 's' : ''} found
                  </ModalMetaText>
                  {studentExams.map((studentExam) => (
                    <StudentExamCard
                      key={studentExam.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewStudentDetail(studentExam);
                      }}
                    >
                      <StudentInfo>
                        <StudentName>{studentExam.studentName}</StudentName>
                        <ExamStatus status={studentExam.status}>
                          {formatExamStatus(studentExam.status)}
                        </ExamStatus>
                      </StudentInfo>
                      <ExamDetails>
                        <DetailItem>
                          <DetailLabel>Score:</DetailLabel>
                          <DetailValue>{(studentExam.score || 0).toFixed(2)}/10</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Status:</DetailLabel>
                          <DetailValue>
                            <ExamStatus status={studentExam.status}>
                              {formatExamStatus(studentExam.status)}
                            </ExamStatus>
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Started:</DetailLabel>
                          <DetailValue>{formatDateTime(studentExam.startTime)}</DetailValue>
                        </DetailItem>
                        {studentExam.endTime && (
                          <DetailItem>
                            <DetailLabel>Completed:</DetailLabel>
                            <DetailValue>{formatDateTime(studentExam.endTime)}</DetailValue>
                          </DetailItem>
                        )}
                      </ExamDetails>
                    </StudentExamCard>
                  ))}
                </>
              )}
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* Student Exam Detail Modal */}
      {showDetailModal && (
        <ModalOverlay onClick={closeDetailModal}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                Exam Details - {selectedStudentExam?.studentName || 'Student'}
              </ModalTitle>
              <CloseButton onClick={closeDetailModal}>×</CloseButton>
            </ModalHeader>
            <ModalContent>
              {!studentExamDetail ? (
                <ModalEmptyState>Loading exam details...</ModalEmptyState>
              ) : (
                <div>
                  {/* Answer Details */}
                  {studentExamDetail.questions && studentExamDetail.questions.length > 0 && (
                    <div>
                      <SectionHeading>Exam Questions & Answers</SectionHeading>
                      
                      {/* Enhanced Switch Tab Display */}
                      {(() => {
                        const switchTabData = studentExamDetail.switchTab;
                        let switchTabList = [];
                        let totalSwitches = 0;

                        if (switchTabData) {
                          if (Array.isArray(switchTabData)) {
                            // switchTab is an array of timestamp strings
                            switchTabList = switchTabData.map((timestamp, index) => {
                              try {
                                const date = new Date(timestamp);
                                
                                return {
                                  index: index + 1,
                                  timestamp: timestamp,
                                  formattedTime: date.toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  }),
                                  relativeTime: date.toLocaleTimeString('vi-VN')
                                };
                              } catch (error) {
                                console.error('Error parsing timestamp:', timestamp, error);
                                return {
                                  index: index + 1,
                                  timestamp: timestamp,
                                  formattedTime: 'Invalid timestamp',
                                  relativeTime: timestamp.substring(0, 20)
                                };
                              }
                            });
                            
                            totalSwitches = switchTabList.length;
                          } else if (typeof switchTabData === 'string') {
                            // Fallback: Parse the timestamp string like "2025-06-03T18:31:51.839957527Z2025-06-03T18:31:55.223224618Z..."
                            // First, split by 'Z' and remove empty entries
                            const timestamps = switchTabData.split('Z').filter(ts => ts.length > 0);
                            
                            switchTabList = timestamps.map((timestamp, index) => {
                              try {
                                // Add 'Z' back to make it a valid ISO string
                                const isoTimestamp = timestamp + 'Z';
                                const date = new Date(isoTimestamp);
                                
                                return {
                                  index: index + 1,
                                  timestamp: isoTimestamp,
                                  formattedTime: date.toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  }),
                                  relativeTime: date.toLocaleTimeString('vi-VN')
                                };
                              } catch (error) {
                                console.error('Error parsing timestamp:', timestamp, error);
                                return {
                                  index: index + 1,
                                  timestamp: timestamp,
                                  formattedTime: 'Invalid timestamp',
                                  relativeTime: timestamp.substring(0, 20)
                                };
                              }
                            });
                            
                            totalSwitches = switchTabList.length;
                          } else if (typeof switchTabData === 'number') {
                            totalSwitches = switchTabData;
                          }
                        }

                        return (
                          <div style={{ 
                            marginBottom: '2rem',
                            padding: '1rem',
                            backgroundColor: theme === 'dark' ? 'rgba(255, 87, 34, 0.1)' : '#fff3e0',
                            borderRadius: '0.75rem',
                            border: `2px solid ${theme === 'dark' ? '#ff5722' : '#ff9800'}`,
                            fontSize: '0.9rem'
                          }}>
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: switchTabList.length > 0 ? '1rem' : '0',
                              fontWeight: '600',
                              color: theme === 'dark' ? '#ffab91' : '#e65100'
                            }}>
                              <span>⚠️</span>
                              <span>Tab Switch Monitoring</span>
                              <span style={{
                                backgroundColor: theme === 'dark' ? '#d84315' : '#ff5722',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                              }}>
                                {totalSwitches} switches
                              </span>
                            </div>

                            {switchTabList.length > 0 ? (
                              <div>
                                <div style={{ 
                                  fontWeight: '500', 
                                  marginBottom: '0.75rem',
                                  color: 'var(--text-secondary)'
                                }}>
                                  Tab Switch Timeline:
                                </div>
                                <div style={{ 
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
                                  borderRadius: '0.5rem',
                                  backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white'
                                }}>
                                  {switchTabList.map((switchInfo, index) => (
                                    <div 
                                      key={index}
                                      style={{
                                        padding: '0.75rem 1rem',
                                        borderBottom: index < switchTabList.length - 1 ? 
                                          `1px solid ${theme === 'dark' ? '#444' : '#eee'}` : 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: index % 2 === 0 ? 
                                          (theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa') : 
                                          'transparent'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                          backgroundColor: theme === 'dark' ? '#ff5722' : '#ff9800',
                                          color: 'white',
                                          padding: '0.2rem 0.5rem',
                                          borderRadius: '50%',
                                          fontSize: '0.75rem',
                                          fontWeight: 'bold',
                                          minWidth: '24px',
                                          textAlign: 'center'
                                        }}>
                                          {switchInfo.index}
                                        </span>
                                        <span style={{ 
                                          color: 'var(--text-primary)',
                                          fontWeight: '500'
                                        }}>
                                          Tab Switch #{switchInfo.index}
                                        </span>
                                      </div>
                                      <div style={{ 
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        textAlign: 'right'
                                      }}>
                                        <div>{switchInfo.formattedTime}</div>
                                        {/* <div style={{ 
                                          fontSize: '0.75rem',
                                          color: theme === 'dark' ? '#aaa' : '#888'
                                        }}>
                                          {switchInfo.relativeTime}
                                        </div> */}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : totalSwitches > 0 ? (
                              <div style={{ 
                                color: 'var(--text-secondary)',
                                fontStyle: 'italic'
                              }}>
                                {totalSwitches} tab switches detected, but detailed timestamps not available.
                              </div>
                            ) : (
                              <div style={{ 
                                color: theme === 'dark' ? '#4caf50' : '#2e7d32',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                <span>✅</span>
                                No tab switches detected - Student remained focused
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {studentExamDetail.questions.map((question, index) => {
                    // Data is already in the question object, no need for fallbacks
                    const isCorrect = question.isCorrect;
                    const studentAnswer = question.studentAnswer || 'No answer';
                    const correctAnswer = question.answer || 'No correct answer';
                    
                    return (
                      <div 
                        key={question.questionId || index} 
                        style={{ 
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.5rem',
                          padding: '1.5rem',
                          marginBottom: '1rem',
                          backgroundColor: 'var(--bg-primary)'
                        }}
                      >
                        {/* Question Header */}
                        <div style={{ 
                          fontWeight: '600', 
                          marginBottom: '1rem',
                          color: 'var(--text-primary)',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            backgroundColor: theme === 'dark' ? '#6a00ff' : '#6a00ff',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '50%',
                            fontSize: '0.8rem',
                            minWidth: '24px',
                            textAlign: 'center'
                          }}>
                            {index + 1}
                          </span>
                          Question {index + 1} - {question.type || 'MULTIPLE_CHOICE'}
                        </div>

                        {/* Question Title */}
                        <div style={{ 
                          marginBottom: '1rem', 
                          padding: '1rem',
                          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa',
                          borderRadius: '0.5rem',
                          borderLeft: '4px solid #6a00ff'
                        }}>
                          <div style={{ fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            Question:
                          </div>
                          <div style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>
                            {question.title || `Question ${question.questionId}`}
                          </div>
                        </div>

                        {/* Choices (if available) */}
                        {question.choices && question.choices.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                              Available Options:
                            </div>
                            <div style={{ 
                              display: 'grid',
                              gap: '0.5rem',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
                            }}>
                              {question.choices.map((choice, choiceIndex) => (
                                <div 
                                  key={choice.optionKey || choiceIndex}
                                  style={{
                                    padding: '0.5rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.25rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    fontSize: '0.9rem'
                                  }}
                                >
                                  <strong>{choice.optionKey}:</strong> {choice.optionValue}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Student Answer */}
                        <div style={{ 
                          marginBottom: '0.5rem',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          backgroundColor: isCorrect 
                            ? (theme === 'dark' ? 'rgba(56, 142, 60, 0.2)' : '#e8f5e9')
                            : (theme === 'dark' ? 'rgba(211, 47, 47, 0.2)' : '#ffebee'),
                          border: `2px solid ${isCorrect 
                            ? (theme === 'dark' ? '#4caf50' : '#4caf50')
                            : (theme === 'dark' ? '#f44336' : '#f44336')}`
                        }}>
                          <div style={{ 
                            fontWeight: '500', 
                            marginBottom: '0.25rem',
                            color: isCorrect 
                              ? (theme === 'dark' ? '#81c784' : '#2e7d32')
                              : (theme === 'dark' ? '#e57373' : '#c62828'),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>{isCorrect ? '✅' : '❌'}</span>
                            Student Answer:
                          </div>
                          <div style={{ 
                            color: 'var(--text-primary)',
                            fontWeight: '500'
                          }}>
                            {studentAnswer}
                          </div>
                        </div>

                        {/* Correct Answer */}
                        <div style={{ 
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          backgroundColor: theme === 'dark' ? 'rgba(56, 142, 60, 0.2)' : '#e8f5e9',
                          border: `2px solid ${theme === 'dark' ? '#4caf50' : '#4caf50'}`
                        }}>
                          <div style={{ 
                            fontWeight: '500', 
                            marginBottom: '0.25rem',
                            color: theme === 'dark' ? '#81c784' : '#2e7d32',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span>✅</span>
                            Correct Answer:
                          </div>
                          <div style={{ 
                            color: 'var(--text-primary)',
                            fontWeight: '500'
                          }}>
                            {correctAnswer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ModalContent>
          </ModalContainer>
        </ModalOverlay>
      )}
    </DashboardContainer>
  );
}

export default ExamPage;
