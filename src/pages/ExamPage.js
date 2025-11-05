import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import examService from '../services/examService';
import classService from '../services/classService';
import questionService from '../services/questionService';
import studentExamService from '../services/studentExamService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';

// Styled Components
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
  
  /* CSS Variables for better dark mode compatibility */
  --bg-input: ${props => props.theme === 'dark' ? '#333' : 'white'};
  --text-input: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
  --hover-bg: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(106, 0, 255, 0.05)'};
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
  padding: 2rem 3rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PageTitle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
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

const SortDropdown = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-input);
  font-size: 0.875rem;
  color: var(--text-input);
  cursor: pointer;
  outline: none;
  
  & option {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const CreateButton = styled.button`
  background-color: transparent;
  color: ${props => props.theme === 'dark' ? '#9d70ff' : '#6a00ff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#9d70ff' : '#6a00ff'};
  border-radius: 30px;
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--hover-bg);
  }
`;

const TableCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const ExamTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const TableHeader = styled.th`
  text-align: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  
  &:first-child {
    width: 40px;
    padding-right: 0;
    text-align: center;
  }
  
  /* Center align for numeric columns */
  &:nth-child(3), /* Value */
  &:nth-child(4), /* Question */
  &:nth-child(5) { /* Time remains */
    text-align: center;
  }
`;

const TableRow = styled.tr`
  &:last-child td {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--hover-bg)'};
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
  text-align: center;
  
  /* Center align for numeric columns */
  &:nth-child(3), /* Value */
  &:nth-child(4), /* Question */
  &:nth-child(5) { /* Time remains */
    text-align: center;
  }
`;

const IndexCell = styled.td`
  padding: 1rem 0.5rem 1rem 1.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
  width: 40px;
  vertical-align: middle;
  text-align: center;
`;

const ActionCell = styled.td`
  padding: 1rem 1.5rem;
  display: flex;
  gap: 12px;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a00ff;
  
  &:hover {
    opacity: 0.8;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a00ff;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ExpiryTime = styled.span`
  color: ${props => props.expired === "true" 
    ? (props.theme === 'dark' ? '#ff6666' : '#ff3e3e') 
    : 'inherit'};
`;

// Add a new styled component for the status badge
const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  background-color: ${props => {
    switch(props.status) {
      case 'SCHEDULED': return props.theme === 'dark' ? 'rgba(25, 118, 210, 0.2)' : '#e3f2fd';
      case 'ONGOING': return props.theme === 'dark' ? 'rgba(245, 124, 0, 0.2)' : '#fff8e1';
      case 'COMPLETED': return props.theme === 'dark' ? 'rgba(56, 142, 60, 0.2)' : '#e8f5e9';
      case 'CANCELLED': return props.theme === 'dark' ? 'rgba(211, 47, 47, 0.2)' : '#ffebee';
      default: return props.theme === 'dark' ? 'rgba(117, 117, 117, 0.2)' : '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'SCHEDULED': return props.theme === 'dark' ? '#90caf9' : '#1976d2';
      case 'ONGOING': return props.theme === 'dark' ? '#ffcc80' : '#f57c00';
      case 'COMPLETED': return props.theme === 'dark' ? '#a5d6a7' : '#388e3c';
      case 'CANCELLED': return props.theme === 'dark' ? '#ef9a9a' : '#d32f2f';
      default: return props.theme === 'dark' ? '#bdbdbd' : '#757575';
    }
  }};
`;

// SVG icons for better quality
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a00ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a00ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const ViewStudentsButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a00ff;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ViewStudentsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a00ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--card-shadow);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const ModalContent = styled.div`
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
`;

const StudentExamCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #6a00ff;
  }
`;

const StudentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const StudentName = styled.span`
  font-weight: 600;
  color: var(--text-primary);
`;

const ExamStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch(props.status) {
      case 'IN_PROGRESS': return props.theme === 'dark' ? 'rgba(245, 124, 0, 0.2)' : '#fff8e1';
      case 'COMPLETED': return props.theme === 'dark' ? 'rgba(56, 142, 60, 0.2)' : '#e8f5e9';
      case 'NOT_STARTED': return props.theme === 'dark' ? 'rgba(117, 117, 117, 0.2)' : '#f5f5f5';
      default: return props.theme === 'dark' ? 'rgba(117, 117, 117, 0.2)' : '#f5f5f5';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'IN_PROGRESS': return props.theme === 'dark' ? '#ffcc80' : '#f57c00';
      case 'COMPLETED': return props.theme === 'dark' ? '#a5d6a7' : '#388e3c';
      case 'NOT_STARTED': return props.theme === 'dark' ? '#bdbdbd' : '#757575';
      default: return props.theme === 'dark' ? '#bdbdbd' : '#757575';
    }
  }};
`;

const ExamDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: var(--text-primary);
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

  // Debug logging
  console.log('🔄 ExamPage render - State:', {
    showStudentModal,
    studentExams: studentExams.length,
    showDetailModal,
    selectedClassId
  });
  
  // Add a useEffect to handle URL query parameters
  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const classIdParam = params.get('classId');
    
    if (classIdParam) {
      console.log(`Found classId in URL: ${classIdParam}`);
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
            console.log('Fetched classes:', fetchedClasses);
            setClasses(fetchedClasses);
            
            // Only set default selection if there's no classId in the URL and no selected ID yet
            const params = new URLSearchParams(location.search);
            const classIdParam = params.get('classId');
            
            if (!classIdParam && fetchedClasses.length > 0 && !selectedClassId) {
              // Set the first class as selected by default
              console.log('Setting default selected class:', fetchedClasses[0].id);
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
      console.log(`Fetching exams for class ID: ${numericClassId}, page: ${currentPage}, size: ${pageSize}`);
      const response = await examService.getExamsByClass(numericClassId, currentPage, pageSize);
      
      // Log the entire response for debugging
      console.log('Raw exam response:', response);
      console.log('Exam response data:', response.data);
      
      // Process exam data with better handling for different response formats
      let fetchedExams = [];
      
      if (response.data && response.data.content) {
        // Paginated response
        fetchedExams = response.data.content;
        console.log(`Processing ${fetchedExams.length} exams from paginated response`);
      } else if (Array.isArray(response.data)) {
        // Array response
        fetchedExams = response.data;
        console.log(`Processing ${fetchedExams.length} exams from array response`);
      } else if (response.data) {
        // Unknown format but has data
        console.warn('Unexpected response format, attempting to process anyway');
        fetchedExams = Array.isArray(response.data) ? response.data : [response.data];
      }
      
      if (!fetchedExams || fetchedExams.length === 0) {
        console.log(`No exams found for class ID: ${numericClassId}`);
        setExams([]);
        setLoading(false);
        return;
      }
      
      // Log the first exam for debugging
      if (fetchedExams.length > 0) {
        console.log('First exam in processed data:', fetchedExams[0]);
      }
      
      // Get question counts for all exams
      const examsWithQuestionPromises = fetchedExams.map(async (exam) => {
        // Debug the raw exam object
        console.log('Raw exam object:', JSON.stringify(exam));
        
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
        console.log('Exam object properties:', Object.keys(exam));
        
        // Log specific title values
        console.log('Exam title from API:', exam.title);
        
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
      
      console.log(`Processed ${formattedExams.length} formatted exams for display`);
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
    console.log('ExamPage: Executing logout after confirmation');
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
      case 'payment': return '💳';
      case 'users': return '👥';
      case 'settings': return '⚙️';
      case 'signout': return '🚪';
      case 'myClasses': return '📚';
      case 'register': return '📋';
      case 'results': return '📊';
      case 'assistant': return '🤖';
      default: return '•';
    }
  };

  // Determine user role
  const isStudent = user && user.role === 'ROLE_STUDENT';
  const isLecturer = user && user.role === 'ROLE_LECTURER';
  const isAdmin = user && user.role === 'ROLE_ADMIN';

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
        console.log(`Attempting to delete exam with ID: ${examId}`);
        setLoading(true);
        const response = await examService.deleteExam(examId);
        console.log('Delete response:', response);
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
    console.log('Rendering exam row with data:', exam);
    return exam;
  };

  // Function to check if a route is active
  const isRouteActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Add a function to refresh exams without changing the selected class
  const refreshExams = () => {
    if (selectedClassId) {
      console.log('Auto-refreshing exam statuses...');
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
      
      console.log('Auto-refresh interval set up');
    }
    
    // Clean up on component unmount or when autoRefresh changes
    return () => {
      if (refreshIntervalRef.current) {
        console.log('Cleaning up auto-refresh interval');
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

    console.log(`🎯 Viewing student exams for exam ID: ${exam.id}`);
    setSelectedExamForStudents(exam);
    setShowStudentModal(true);
    setStudentExamsLoading(true);
    setStudentExams([]);

    try {
      const response = await studentExamService.getStudentExamsByExamId(exam.id);
      console.log('🔍 Student exams response:', response.data);
      
      // Process the response data
      const fetchedStudentExams = Array.isArray(response.data) ? response.data : [];
      console.log('📋 Fetched student exams array:', fetchedStudentExams);
      
      // Format the data for display
      const formattedStudentExams = fetchedStudentExams.map((studentExam, index) => {
        console.log(`🔄 Processing student exam ${index + 1}:`, studentExam);
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

      console.log(`✅ Processed ${formattedStudentExams.length} student exams:`, formattedStudentExams);
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
    console.log('🔍 handleViewStudentDetail called with:', studentExam);
    
    if (!studentExam || !studentExam.id) {
      console.error('handleViewStudentDetail: Invalid studentExam object', studentExam);
      return;
    }

    console.log(`Viewing detail for student exam ID: ${studentExam.id}`);
    setSelectedStudentExam(studentExam);
    setShowDetailModal(true);
    setStudentExamDetail(null);

    try {
      const response = await studentExamService.getStudentExamDetail(studentExam.id);
      console.log('🔍 Student exam detail response:', response.data);
      console.log('🔍 Response structure:', JSON.stringify(response.data, null, 2));
      
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
    <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <Sidebar theme={theme}>
        <Logo>logo</Logo>
        <SidebarMenu>
          {isStudent ? (
            // Student navigation
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
            // Lecturer navigation
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
            // Admin navigation
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
              <NavItem to="/ai-assistant" className={isRouteActive('/ai-assistant') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('assistant')}</NavIcon>
                AI Assistant
              </NavItem>
              {/* <NavItem to="/payment" className={isRouteActive('/payment') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('payment')}</NavIcon>
                Payment
              </NavItem>
              <NavItem to="/users" className={isRouteActive('/users') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('users')}</NavIcon>
                Users
              </NavItem> */}
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
          <PageTitle>Exam</PageTitle>
          
          <HeaderRight>
            {/* <ThemeToggle /> */}
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginRight: '1rem', 
              marginLeft: '1rem',
              fontSize: '0.8rem',
              color: '#666'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginRight: '0.5rem', 
                fontSize: '0.8rem',
                color: theme === 'dark' ? '#aaa' : '#666'
              }}>
                <span>Last updated: {lastRefreshTime.toLocaleTimeString()}</span>
                <button 
                  onClick={() => selectedClassId ? fetchExams(selectedClassId) : null}
                  style={{
                    marginLeft: '8px',
                    background: theme === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme === 'dark' ? '#90caf9' : '#1976d2',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                  title="Refresh exams"
                >
                  <span style={{ fontSize: '16px' }}>↻</span>
                </button>
              </div>
            </div>
            {(isLecturer || isAdmin) && (
              <CreateButton onClick={handleCreateExam}>
                + Create Exam
              </CreateButton>
            )}
          </HeaderRight>
        </Header>
        
        {/* Class selection dropdown */}
        {classesLoading ? (
          <div style={{ marginBottom: '1rem' }}>Loading classes...</div>
        ) : classes.length > 0 ? (
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="classSelect" style={{ marginRight: '0.5rem' }}>Select Class:</label>
            <SortDropdown 
              id="classSelect"
              value={selectedClassId || ''}
              onChange={(e) => {
                const newClassId = e.target.value ? parseInt(e.target.value, 10) : null;
                console.log(`Class changed from ${selectedClassId} to ${newClassId}`);
                setSelectedClassId(newClassId);
              }}
            >
              <option value="">Select a class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name || c.title || `Class ${c.id}`}
                </option>
              ))}
            </SortDropdown>
          </div>
        ) : (
          <div style={{ marginBottom: '1rem', color: theme === 'dark' ? '#aaa' : '#666' }}>
            {error ? error : 'No classes available.'}
            {isLecturer && !error && (
              <span> Please create a class first to manage exams.</span>
            )}
          </div>
        )}
        
        {error && <div style={{ color: 'red', margin: '1rem 0' }}>{error}</div>}
        
        <TableCard>
          {!selectedClassId ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              Please select a class to view exams
            </div>
          ) : loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading exams...</div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
              {error}
            </div>
          ) : exams.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: theme === 'dark' ? '#aaa' : '#666' }}>
              No exams available for this class.
              {isStudent && (
                <p style={{ 
                  marginTop: '1rem', 
                  fontSize: '0.9rem',
                  color: theme === 'dark' ? '#bbb' : '#888'
                }}>
                  If you believe this is an error, please contact your instructor.
                </p>
              )}
            </div>
          ) : (
            <ExamTable>
              <thead>
                <tr>
                  <TableHeader></TableHeader>
                  <TableHeader>Exams</TableHeader>
                  <TableHeader>Value</TableHeader>
                  <TableHeader>Question</TableHeader>
                  <TableHeader>Time remains</TableHeader>
                  <TableHeader>Status</TableHeader>
                  {(isLecturer || isAdmin) && <TableHeader>Actions</TableHeader>}
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => {
                  const currentExam = debugExamData(exam);
                  return (
                    <TableRow 
                      key={currentExam.id || `exam-${Math.random()}`}
                      style={{
                        // For student view, highlight ongoing exams with theme-appropriate colors
                        backgroundColor: isStudent && currentExam.status === 'ONGOING' 
                          ? (theme === 'dark' ? 'rgba(141, 71, 255, 0.1)' : '#f8f9ff') 
                          : 'inherit',
                        cursor: isStudent && currentExam.status === 'ONGOING' ? 'pointer' : 'default',
                      }}
                      onClick={() => {
                                                  // For students, clicking on an ongoing exam row would take them to the exam
                          if (isStudent && currentExam.status === 'ONGOING') {
                            // Chỉ lưu studentExamId vào localStorage - các thông tin khác sẽ do API cung cấp
                            const studentExamId = `${user.id}-${currentExam.id}`;
                            console.log(`Storing exam ID: ${currentExam.id} for user: ${user.id}`);
                            localStorage.setItem('currentStudentExamId', studentExamId);
                            
                            // Then navigate to start-exam page
                            navigate(`/start-exam/${currentExam.id}`);
                          }
                      }}
                    >
                      <IndexCell>#{currentExam.id || 0}</IndexCell>
                      <TableCell>{currentExam.title || currentExam.name || `Exam ${currentExam.id || 0}`}</TableCell>
                      <TableCell>{currentExam.value || 100}</TableCell>
                      <TableCell>{typeof currentExam.questions === 'number' ? currentExam.questions : (Array.isArray(currentExam.questions) ? currentExam.questions.length : 0)}</TableCell>
                      <TableCell>
                        <ExpiryTime expired={isExpired(currentExam.timeRemains || '00:00:00') ? "true" : "false"} theme={theme}>
                          {currentExam.timeRemains || '00:00:00'}
                        </ExpiryTime>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={currentExam.status || 'SCHEDULED'} theme={theme}>
                          {formatStatus(currentExam.status || 'SCHEDULED')}
                        </StatusBadge>
                        {isStudent && currentExam.status === 'ONGOING' && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            color: theme === 'dark' ? '#90caf9' : '#1976d2', 
                            marginTop: '0.2rem',
                            fontWeight: '500'
                          }}>
                            Click to take exam
                          </div>
                        )}
                      </TableCell>
                      {(isLecturer || isAdmin) && (
                        <ActionCell>
                          <ViewStudentsButton 
                            title="View Students" 
                            onClick={() => handleViewStudents(currentExam)}
                          >
                            <ViewStudentsIcon />
                          </ViewStudentsButton>
                          <EditButton title="Edit" onClick={() => handleEditExam(currentExam.id)}>
                            <EditIcon />
                          </EditButton>
                          <DeleteButton 
                            title="Delete" 
                            onClick={() => handleDeleteExam(currentExam.id)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </DeleteButton>
                        </ActionCell>
                      )}
                    </TableRow>
                  );
                })}
              </tbody>
            </ExamTable>
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
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading student exams...
                </div>
              ) : studentExams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No students have taken this exam yet.
                </div>
              ) : (
                <>
                  <div style={{ 
                    marginBottom: '1rem', 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    {studentExams.length} student{studentExams.length !== 1 ? 's' : ''} found
                  </div>
                  {studentExams.map((studentExam) => (
                    <StudentExamCard 
                      key={studentExam.id} 
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        pointerEvents: 'auto'
                      }}
                      onClick={(e) => {
                        console.log('🖱️ StudentExamCard clicked!', studentExam);
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewStudentDetail(studentExam);
                      }}
                    >
                      <StudentInfo>
                        <StudentName>{studentExam.studentName}</StudentName>
                        <ExamStatus status={studentExam.status} theme={theme}>
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
                            <ExamStatus status={studentExam.status} theme={theme}>
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
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading exam details...
                </div>
              ) : (
                <div>
                  {/* Answer Details */}
                  {studentExamDetail.questions && studentExamDetail.questions.length > 0 && (
                    <div>
                      <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        Exam Questions & Answers
                      </h3>
                      
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
    </PageContainer>
  );
}

export default ExamPage; 
