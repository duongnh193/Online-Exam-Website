import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import examService from '../services/examService';
import classService from '../services/classService';

// Styled Components
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Sidebar = styled.aside`
  width: 180px;
  background-color: #6a00ff;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 0 20px 20px 0;
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
  color: #333;
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
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 180px;
  z-index: 100;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
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

const CreateButton = styled.button`
  background-color: transparent;
  color: #6a00ff;
  border: 1px solid #6a00ff;
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
    background-color: rgba(106, 0, 255, 0.05);
  }
`;

const TableCard = styled.div`
  background-color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ExamTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  color: #666;
  font-weight: 600;
  font-size: 0.9rem;
  
  &:first-child {
    width: 40px;
    padding-right: 0;
  }
`;

const TableRow = styled.tr`
  &:last-child td {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  color: #333;
  font-size: 0.9rem;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
`;

const IndexCell = styled.td`
  padding: 1rem 0.5rem 1rem 1.5rem;
  color: #666;
  font-size: 0.9rem;
  border-bottom: 1px solid #eee;
  width: 40px;
  vertical-align: middle;
`;

const ActionCell = styled.td`
  padding: 1rem 1.5rem;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-bottom: 1px solid #eee;
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
  color: ${props => props.expired ? '#ff3e3e' : 'inherit'};
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
      case 'SCHEDULED': return '#e3f2fd'; // Light blue
      case 'ONGOING': return '#fff8e1'; // Light yellow
      case 'COMPLETED': return '#e8f5e9'; // Light green
      case 'CANCELLED': return '#ffebee'; // Light red
      default: return '#f5f5f5'; // Light gray
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'SCHEDULED': return '#1976d2'; // Blue
      case 'ONGOING': return '#f57c00'; // Orange
      case 'COMPLETED': return '#388e3c'; // Green
      case 'CANCELLED': return '#d32f2f'; // Red
      default: return '#757575'; // Gray
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

function ExamPage() {
  const { user, logout } = useAuth();
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
  
  // Fetch classes when component mounts
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
        // For students, fetch classes they're enrolled in
        fetchClassesPromise = classService.getStudentClasses(user.id);
      }
      
      if (fetchClassesPromise) {
        fetchClassesPromise
          .then(response => {
            const fetchedClasses = response.data.content || response.data;
            console.log('Fetched classes:', fetchedClasses);
            setClasses(fetchedClasses);
            
            if (fetchedClasses.length > 0) {
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
  }, [user]);
  
  // Fetch exams when selectedClassId changes
  useEffect(() => {
    if (selectedClassId) {
      // Skip if we're currently handling a direct exam fetch from navigation state
      if (location.state?.createdExamId && location.state?.classId === selectedClassId) {
        console.log('Skipping automatic fetch because we\'re handling a direct exam fetch');
        return;
      }
      fetchExams(selectedClassId);
    } else {
      // Clear exams if no class is selected
      setExams([]);
      setLoading(false);
    }
  }, [selectedClassId, currentPage, pageSize]);
  
  // Extract classId from URL query parameters - only run once or when URL changes
  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);
      const classIdParam = params.get('classId');
      if (classIdParam && !isNaN(parseInt(classIdParam))) {
        setSelectedClassId(parseInt(classIdParam));
      }
    }
  }, [location.search]);
  
  // Handle navigation state from CreateExamPage
  useEffect(() => {
    // Check if we have state from navigation (after creating/editing an exam)
    if (location.state && location.state.classId && (location.state.createdExamId || location.state.action)) {
      console.log('Received navigation state:', location.state);
      
      // Set the selected class to show the exam that was just created/edited
      const classId = parseInt(location.state.classId);
      if (classId && !isNaN(classId)) {
        setSelectedClassId(classId);
        
        // If we have a specific exam ID that was just created/edited,
        // we can directly fetch that exam to ensure it's shown regardless of status
        if (location.state.createdExamId) {
          const examId = location.state.createdExamId;
          console.log(`Directly fetching exam with ID: ${examId} that was just ${location.state.action}`);
          
          // Make direct API call to get the exam
          examService.getExamById(examId)
            .then(response => {
              console.log('Successfully fetched created/edited exam:', response.data);
              
              // Format the exam as needed and add it to the list
              if (response.data) {
                const exam = response.data;
                let timeRemains = '00:00:00';
                let expired = false;
                
                if (exam.endAt) {
                  const endTime = new Date(exam.endAt);
                  const now = new Date();
                  const diff = endTime - now;
                  
                  if (diff > 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    
                    timeRemains = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                  } else {
                    expired = true;
                  }
                }
                
                const formattedExam = {
                  id: exam.id,
                  name: exam.title,
                  value: exam.totalScore || 100,
                  questions: exam.questionCount || (exam.questions ? exam.questions.length : 0),
                  timeRemains: timeRemains,
                  expired: expired,
                  status: exam.status,
                  startAt: exam.startAt,
                  endAt: exam.endAt,
                  duration: exam.duration
                };
                
                // Add the exam to the current list or replace it if it exists
                setExams(prevExams => {
                  const examExists = prevExams.some(e => e.id === formattedExam.id);
                  
                  if (examExists) {
                    return prevExams.map(e => e.id === formattedExam.id ? formattedExam : e);
                  } else {
                    return [...prevExams, formattedExam];
                  }
                });
              }
            })
            .catch(err => {
              console.error('Error fetching specific exam:', err);
              // Still proceed with normal class fetch as fallback
              fetchExams(classId);
            });
        } else {
          // If no specific exam ID, fetch all exams for the class
          fetchExams(classId);
        }
      }
      
      // Clear the state to prevent it from persisting on refresh
      // This must be done after we've used the data
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const fetchExams = async (classId) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching exams for class ID: ${classId}, page: ${currentPage}, size: ${pageSize}`);
      
      // First attempt to fetch all exams without filtering by status
      let response = await examService.getExamsByClass(classId, currentPage, pageSize);
      
      // If no exams are found or there's an issue, try with specific status values
      if (!response.data || 
          (response.data.content && response.data.content.length === 0) ||
          (Array.isArray(response.data) && response.data.length === 0)) {
        
        console.log("No exams found with default query, trying with specific statuses...");
        
        // Try with all possible status values that match the backend enum
        // SCHEDULED, ONGOING, COMPLETED, CANCELLED are the only valid statuses
        const statusValues = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'];
        
        for (const status of statusValues) {
          try {
            console.log(`Trying with status: ${status}`);
            const statusResponse = await examService.getExamsByClass(classId, currentPage, pageSize, status);
            
            if (statusResponse.data && 
                ((statusResponse.data.content && statusResponse.data.content.length > 0) ||
                 (Array.isArray(statusResponse.data) && statusResponse.data.length > 0))) {
              response = statusResponse;
              console.log(`Found exams with status: ${status}`);
              break;
            }
          } catch (statusErr) {
            console.warn(`Error fetching exams with status ${status}:`, statusErr.message);
            // Continue to next status - don't break the loop
          }
        }
      }
      
      console.log('Fetched exams response:', response);
      
      // Process exam data
      let fetchedExams = [];
      if (response.data) {
        if (response.data.content && Array.isArray(response.data.content)) {
          fetchedExams = response.data.content;
        } else if (Array.isArray(response.data)) {
          fetchedExams = response.data;
        } else {
          console.warn('Unexpected response format:', response.data);
          fetchedExams = [];
        }
      }
      
      console.log(`Processed ${fetchedExams.length} exams from response`);
      
      if (fetchedExams.length === 0) {
        setExams([]);
        return;
      }
      
      // Format exams to match the UI requirements
      const formattedExams = fetchedExams.map(exam => {
        // Calculate time remaining until exam end time
        let timeRemains = '00:00:00';
        let expired = false;
        
        if (exam.endAt) {
          const endTime = new Date(exam.endAt);
          const now = new Date();
          const diff = endTime - now;
          
          if (diff > 0) {
            // Format as hh:mm:ss
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            timeRemains = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          } else {
            expired = true;
          }
        }
        
        // Check for questions count - ensure we have a valid value
        const questionsCount = exam.questionCount || 
                               (exam.questions ? exam.questions.length : 0);
        
        return {
          id: exam.id,
          name: exam.title,
          value: exam.totalScore || 100,
          questions: questionsCount,
          timeRemains: timeRemains,
          expired: expired,
          status: exam.status,
          startAt: exam.startAt,
          endAt: exam.endAt,
          duration: exam.duration
        };
      });
      
      setExams(formattedExams);
    } catch (err) {
      console.error('Error fetching exams:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setError('You do not have permission to view exams for this class.');
        } else if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
          setTimeout(() => logout(), 2000);
        } else {
          setError(`Failed to load exams: ${err.response.data || 'Unknown error'}`);
        }
      } else {
        setError('Failed to load exams. Please check your internet connection and try again.');
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
  
  const handleLogout = () => {
    logout();
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
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examService.deleteExam(examId);
        // Refresh the exam list
        fetchExams(selectedClassId);
      } catch (err) {
        console.error('Error deleting exam:', err);
        alert('Failed to delete exam. Please try again.');
      }
    }
  };

  // Function to format status for display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Convert from SCREAMING_SNAKE_CASE to Title Case
    return status.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <PageContainer>
      <Sidebar>
        <Logo>logo</Logo>
        <SidebarMenu>
          {isStudent ? (
            // Student navigation
            <>
              <NavItem to="/student-dashboard">
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams" className="active">
                <NavIcon>{getMenuIcon('exams')}</NavIcon>
                Exams
              </NavItem>
              <NavItem to="/results">
                <NavIcon>{getMenuIcon('results')}</NavIcon>
                Results
              </NavItem>
            </>
          ) : isLecturer ? (
            // Lecturer navigation
            <>
              <NavItem to="/lecturer-dashboard">
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams" className="active">
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
            </>
          ) : (
            // Admin navigation
            <>
              <NavItem to="/admin-dashboard">
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams" className="active">
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
              <NavItem to="/payment">
                <NavIcon>{getMenuIcon('payment')}</NavIcon>
                Payment
              </NavItem>
              <NavItem to="/users">
                <NavIcon>{getMenuIcon('users')}</NavIcon>
                Users
              </NavItem>
            </>
          )}
        </SidebarMenu>
        <BottomMenu>
          <NavItem to="/settings">
            <NavIcon>{getMenuIcon('settings')}</NavIcon>
            Settings
          </NavItem>
          <NavItem to="/" onClick={handleLogout}>
            <NavIcon>{getMenuIcon('signout')}</NavIcon>
            Sign out
          </NavItem>
        </BottomMenu>
      </Sidebar>
      
      <MainContent>
        <Header>
          <PageTitle>{isStudent ? 'My Exams' : 'Exams'}</PageTitle>
          
          <HeaderRight>
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
              onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
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
          <div style={{ marginBottom: '1rem', color: '#666' }}>
            {error ? error : (isStudent ? 'You are not enrolled in any classes yet.' : 'No classes available.')}
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
          ) : exams.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              {isStudent ? 'No exams available for this class.' : 'No exams available for this class.'}
              {isLecturer || isAdmin ? (
                <div style={{ marginTop: '1rem' }}>
                  <CreateButton onClick={handleCreateExam}>
                    + Create Exam
                  </CreateButton>
                </div>
              ) : null}
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
                {exams.map(exam => (
                  <TableRow key={exam.id}>
                    <IndexCell>#{exam.id}</IndexCell>
                    <TableCell>{exam.name}</TableCell>
                    <TableCell>{exam.value}</TableCell>
                    <TableCell>{exam.questions}</TableCell>
                    <TableCell>
                      <ExpiryTime expired={isExpired(exam.timeRemains)}>
                        {exam.timeRemains}
                      </ExpiryTime>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={exam.status}>
                        {formatStatus(exam.status)}
                      </StatusBadge>
                    </TableCell>
                    {(isLecturer || isAdmin) && (
                      <ActionCell>
                        <EditButton title="Edit" onClick={() => handleEditExam(exam.id)}>
                          <EditIcon />
                        </EditButton>
                        <DeleteButton title="Delete" onClick={() => handleDeleteExam(exam.id)}>
                          <DeleteIcon />
                        </DeleteButton>
                      </ActionCell>
                    )}
                  </TableRow>
                ))}
              </tbody>
            </ExamTable>
          )}
        </TableCard>
      </MainContent>
    </PageContainer>
  );
}

export default ExamPage; 