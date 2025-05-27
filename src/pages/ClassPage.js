import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import classService from '../services/classService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';

// Styled Components
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
  
  /* CSS Variables for dark mode compatibility */
  --bg-secondary: ${props => props.theme === 'dark' ? '#222' : 'white'};
  --text-primary: ${props => props.theme === 'dark' ? '#fff' : '#333'};
  --text-secondary: ${props => props.theme === 'dark' ? '#ccc' : '#666'};
  --border-color: ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  --card-shadow: ${props => props.theme === 'dark' ? '0 2px 10px rgba(0, 0, 0, 0.2)' : '0 2px 10px rgba(0, 0, 0, 0.05)'};
  --hover-bg: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9'};
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
  margin-right: 15px;
  
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

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SortDropdown = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
`;

const ImportButton = styled.button`
  background-color: #6a00ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #5700d1;
  }
`;

const ExamineesTable = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr 80px;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-secondary);
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr 80px;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9'};
  }
`;

const RowNumber = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6a00ff;
  padding: 4px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const AddButton = styled.button`
  background-color: white;
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
  margin-top: 1rem;
  
  &:hover {
    background-color: #f0e6ff;
  }
`;

const Modal = styled.div`
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

const ModalContent = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  padding: 2rem;
  width: 500px;
  max-width: 90%;
  color: var(--text-primary);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: #6a00ff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? '#6a00ff' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: ${props => props.active ? 'none' : `1px solid var(--border-color)`};
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: ${props => props.active ? '#6a00ff' : props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f8f8'};
  }
  
  &:last-child {
    margin-right: 0;
  }
`;

const Button = styled.button`
  background-color: ${props => props.variant === 'outlined' ? 'transparent' : '#6a00ff'};
  color: ${props => props.variant === 'outlined' ? '#6a00ff' : 'white'};
  border: ${props => props.variant === 'outlined' ? '1px solid #6a00ff' : 'none'};
  border-radius: 30px;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.variant === 'outlined' ? 'rgba(106, 0, 255, 0.05)' : '#5900d9'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Icon Components
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function ClassPage() {
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Redirect if not a lecturer or admin
  useEffect(() => {
    if (user && user.role !== 'ROLE_LECTURER' && user.role !== 'ROLE_ADMIN') {
      console.log('ClassPage: Unauthorized access attempt, user role:', user.role);
      navigate('/student-dashboard');
    }
  }, [user, navigate]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('Last Week');
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  
  // State for class creation/editing
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [classFormData, setClassFormData] = useState({
    name: '',
    description: '',
    teacherId: ''
  });
  const [currentClassId, setCurrentClassId] = useState(null);

  // State for handling student imports
  const [selectedClassForImport, setSelectedClassForImport] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState('csv'); // 'csv' or 'manual'
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [selectedFileError, setSelectedFileError] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (user) {
      fetchClasses();
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

  const fetchClasses = async () => {
    try {
      setLoading(true);
      console.log('fetchClasses: Starting to fetch classes for user:', user);
      console.log('fetchClasses: User role:', user.role);
      console.log('fetchClasses: User ID:', user.id);
      
      let response;
      
      // Call different API based on user role
      if (user.role === 'ROLE_ADMIN') {
        // Admin can see all classes
        console.log('fetchClasses: User is admin, fetching all classes');
        response = await classService.getAllClasses();
      } else if (user.role === 'ROLE_LECTURER') {
        // Lecturer can only see their own classes
        console.log('fetchClasses: User is lecturer, fetching classes for teacher ID:', user.id);
        response = await classService.getClassesByTeacher(user.id);
      } else if (user.role === 'ROLE_STUDENT') {
        // Student can only see enrolled classes
        console.log('fetchClasses: User is student, fetching enrolled classes for student ID:', user.id);
        response = await classService.getStudentClasses(user.id);
      } else {
        console.warn('fetchClasses: Unknown user role:', user.role);
        setError("Access denied. Unknown user role.");
        setLoading(false);
        return;
      }
      
      console.log('fetchClasses: API Response:', response);
      
      // Handle potential different response formats
      let classesData = [];
      if (response.data) {
        if (response.data.content && Array.isArray(response.data.content)) {
          classesData = response.data.content;
        } else if (Array.isArray(response.data)) {
          classesData = response.data;
        } else {
          console.warn('fetchClasses: Unexpected response format:', response.data);
        }
      }
      
      console.log('fetchClasses: Classes data:', classesData);
      
      if (classesData.length === 0) {
        setClasses([]);
        setLoading(false);
        return;
      }
      
      // Only fetch student counts for admin and lecturer roles
      if (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_LECTURER') {
        // Fetch student counts for each class
        const classesWithStudentCounts = await Promise.all(classesData.map(async (classItem) => {
          try {
            console.log(`fetchClasses: Fetching student count for class ID ${classItem.id}`);
            const countResponse = await classService.getStudentCountForClass(classItem.id);
            
            // Log the response to help with debugging
            console.log(`fetchClasses: Student count API response for class ${classItem.id}:`, countResponse);
            
            // Make sure we handle different formats and potential undefined values
            let studentCount = 0;
            if (countResponse && countResponse.data !== undefined) {
              studentCount = typeof countResponse.data === 'number' ? countResponse.data : 0;
            }
            
            console.log(`fetchClasses: Student count for class ${classItem.id}: ${studentCount}`);
            
            return {
              ...classItem,
              studentCount: studentCount
            };
          } catch (err) {
            console.error(`Error fetching student count for class ${classItem.id}:`, err);
            return {
              ...classItem,
              studentCount: 0
            };
          }
        }));
        
        setClasses(classesWithStudentCounts);
      } else {
        // For students, we don't need student counts
        setClasses(classesData);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching classes:", err);
      console.error("Error details:", err.response?.data || err.message);
      console.error("Error status:", err.response?.status);
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    // Trigger the hidden file input
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedClassForImport) {
      event.target.value = '';
      return;
    }
    
    setSelectedFile(file);
    setImportLoading(true);
    setImportError(null);
    setImportSuccess(null);
    
    try {
      const response = await classService.importStudentsFromCsv(selectedClassForImport.id, file);
      console.log('Import response:', response);
      setImportSuccess(response.data || `Students successfully imported to ${selectedClassForImport.name}`);
      
      // Refresh the class list to update student counts
      fetchClasses();
      
      // Refresh the students list for this class
      fetchClassStudents(selectedClassForImport.id);
    } catch (err) {
      console.error("Error importing students:", err);
      setImportError(`Failed to import students: ${err.response?.data || err.message}`);
    } finally {
      // Reset the file input
      event.target.value = '';
      setSelectedFile(null);
      setImportLoading(false);
    }
  };

  const handleAddClass = () => {
    // Reset form data
    setClassFormData({
      name: '',
      description: '',
      teacherId: user.role === 'ROLE_LECTURER' ? user.id : ''
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleEditClass = (classId) => {
    // Find the class to edit
    const classToEdit = classes.find(c => c.id === classId);
    if (!classToEdit) return;
    
    setClassFormData({
      name: classToEdit.name,
      description: classToEdit.description,
      teacherId: classToEdit.teacherId || user.id
    });
    setCurrentClassId(classId);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setClassFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        // Create new class
        await classService.createClass(classFormData);
        alert('Class created successfully!');
      } else {
        // Update existing class
        await classService.updateClass(currentClassId, classFormData);
        alert('Class updated successfully!');
      }
      
      // Close modal and refresh classes
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      console.error('Error saving class:', err);
      alert(`Failed to ${modalMode === 'create' ? 'create' : 'update'} class: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteClass = (classId) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      classService.deleteClass(classId)
        .then(response => {
          alert("Class deleted successfully!");
          fetchClasses(); // Refresh the list
        })
        .catch(err => {
          console.error("Error deleting class:", err);
          alert(`Failed to delete class: ${err.response?.data?.message || "Unknown error"}`);
        });
    }
  };

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    setShowLogoutConfirmation(true);
  };

  const handleConfirmLogout = () => {
    console.log('ClassPage: Executing logout after confirmation');
    logout();
    setShowLogoutConfirmation(false);
  };

  const getUserInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getMenuIcon = (name) => {
    switch (name) {
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
  const isLecturer = user && user.role === 'ROLE_LECTURER';
  const isAdmin = user && user.role === 'ROLE_ADMIN';

  // Method to open import modal
  const handleOpenImportModal = (classId, className) => {
    setSelectedClassForImport({ id: classId, name: className });
    setShowImportModal(true);
    setImportMode('csv');
    setUsernameOrEmail('');
    setImportError(null);
    setImportSuccess(null);
    setImportLoading(false);
    
    // Fetch current students in class
    fetchClassStudents(classId);
  };
  
  // Fetch students in a class
  const fetchClassStudents = async (classId) => {
    try {
      setImportLoading(true);
      const response = await classService.getStudentsInClass(classId);
      console.log('Students in class:', response.data);
      
      // Handle different response formats
      let students = [];
      if (response.data && response.data.content) {
        students = response.data.content;
      } else if (Array.isArray(response.data)) {
        students = response.data;
      }
      
      setClassStudents(students);
      setImportError(null);
    } catch (err) {
      console.error('Error fetching class students:', err);
      setImportError('Failed to fetch current students in this class');
      setClassStudents([]);
    } finally {
      setImportLoading(false);
    }
  };

  // Add student by username or email
  const handleAddStudentManually = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !selectedClassForImport) return;
    
    setImportLoading(true);
    setImportError(null);
    setImportSuccess(null);
    
    try {
      const response = await classService.addStudentToClass(selectedClassForImport.id, usernameOrEmail);
      console.log('Add student response:', response);
      setImportSuccess(`Student ${usernameOrEmail} successfully added to ${selectedClassForImport.name}`);
      
      // Clear the input
      setUsernameOrEmail('');
      
      // Refresh the class list to update student counts
      fetchClasses();
      
      // Refresh the students list for this class
      fetchClassStudents(selectedClassForImport.id);
    } catch (err) {
      console.error("Error adding student:", err);
      setImportError(`Failed to add student: ${err.response?.data || err.message}`);
    } finally {
      setImportLoading(false);
    }
  };
  
  // Remove student from class
  const handleRemoveStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to remove ${student.username || student.email} from this class?`)) {
      return;
    }
    
    if (!selectedClassForImport) return;
    
    setImportLoading(true);
    
    try {
      const identifier = student.username || student.email;
      const response = await classService.removeStudentFromClass(selectedClassForImport.id, identifier);
      console.log('Remove student response:', response);
      
      // Refresh the class list to update student counts
      fetchClasses();
      
      // Refresh the students list for this class
      fetchClassStudents(selectedClassForImport.id);
      
      setImportSuccess(`Student ${identifier} successfully removed from class`);
    } catch (err) {
      console.error("Error removing student:", err);
      setImportError(`Failed to remove student: ${err.response?.data || err.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <Sidebar theme={theme}>
        <Logo>logo</Logo>
        <SidebarMenu>
          {isAdmin ? (
            // Admin navigation
            <>
              <NavItem to="/admin-dashboard">
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams">
                <NavIcon>{getMenuIcon('exams')}</NavIcon>
                Exams
              </NavItem>
              <NavItem to="/class" className="active">
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
            </>
          ) : (
            // Lecturer navigation
            <>
              <NavItem to="/lecturer-dashboard">
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams">
                <NavIcon>{getMenuIcon('exams')}</NavIcon>
                Exams
              </NavItem>
              <NavItem to="/class" className="active">
                <NavIcon>{getMenuIcon('class')}</NavIcon>
                Class
              </NavItem>
              <NavItem to="/reports">
                <NavIcon>{getMenuIcon('reports')}</NavIcon>
                Reports
              </NavItem>
            </>
          )}
        </SidebarMenu>
        <BottomMenu>
          <NavItem to="/settings">
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
          <PageTitle>Classes</PageTitle>
          <HeaderRight>
            {/* <ThemeToggle /> */}
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

        <ContentHeader>
          <div>
            <label htmlFor="sortDropdown">Sort: </label>
            <SortDropdown 
              id="sortDropdown"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="Last Week">Last Week</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Year">This Year</option>
            </SortDropdown>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={handleAddClass}>
              <span>➕</span> Add Class
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".csv" 
            />
          </div>
        </ContentHeader>

        {loading ? (
          <div>Loading classes...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <ExamineesTable>
            <TableHeader>
              <div></div>
              <div>Name</div>
              <div>Description</div>
              <div>Number of Students</div>
              <div>Actions</div>
            </TableHeader>
            
            {classes.length > 0 ? (
              classes.map((classItem, index) => (
                <TableRow key={classItem.id}>
                  <RowNumber>#{index + 1}</RowNumber>
                  <div>{classItem.name}</div>
                  <div>{classItem.description}</div>
                  <div>{classItem.studentCount}</div>
                  <ActionButtons>
                    <ActionButton 
                      title="Manage Students" 
                      onClick={() => handleOpenImportModal(classItem.id, classItem.name)}
                      style={{ color: '#4285f4' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </ActionButton>
                    <ActionButton title="Edit Class" onClick={() => handleEditClass(classItem.id)}>
                      <EditIcon />
                    </ActionButton>
                    <ActionButton title="Delete Class" onClick={() => handleDeleteClass(classItem.id)}>
                      <DeleteIcon />
                    </ActionButton>
                  </ActionButtons>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <div colSpan="5" style={{ gridColumn: "span 5", textAlign: "center", padding: "1rem" }}>
                  No classes found. Create your first class to get started!
                </div>
              </TableRow>
            )}
          </ExamineesTable>
        )}
      </MainContent>

      {/* Class Form Modal */}
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? 'Create New Class' : 'Edit Class'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleFormSubmit}>
              <FormGroup>
                <Label>Class Name</Label>
                <Input 
                  type="text" 
                  name="name"
                  value={classFormData.name}
                  onChange={handleFormChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <Input 
                  type="text" 
                  name="description"
                  value={classFormData.description}
                  onChange={handleFormChange}
                />
              </FormGroup>
              
              {user.role === 'ROLE_ADMIN' && (
                <FormGroup>
                  <Label>Teacher ID</Label>
                  <Input 
                    type="text" 
                    name="teacherId"
                    value={classFormData.teacherId}
                    onChange={handleFormChange}
                    required
                  />
                </FormGroup>
              )}
              
              <ButtonGroup>
                <Button type="button" variant="outlined" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {modalMode === 'create' ? 'Create Class' : 'Save Changes'}
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Student Import/Management Modal */}
      {showImportModal && selectedClassForImport && (
        <Modal>
          <ModalContent style={{ width: '650px', maxWidth: '90vw' }}>
            <ModalHeader>
              <ModalTitle>
                Manage Students - {selectedClassForImport.name}
              </ModalTitle>
              <CloseButton onClick={() => setShowImportModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', marginBottom: '1rem' }}>
                <TabButton 
                  active={importMode === 'csv'} 
                  onClick={() => setImportMode('csv')}
                >
                  Import CSV File
                </TabButton>
                <TabButton 
                  active={importMode === 'manual'} 
                  onClick={() => setImportMode('manual')}
                >
                  Add Individual Student
                </TabButton>
                <TabButton 
                  active={importMode === 'list'} 
                  onClick={() => {
                    setImportMode('list');
                    fetchClassStudents(selectedClassForImport.id);
                  }}
                >
                  View Students
                </TabButton>
              </div>
              
              {importMode === 'csv' && (
                <div>
                  <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    Upload a CSV file with student data. The file should have headers, and must include an email column.
                  </p>
                  
                  <div style={{ 
                    border: '2px dashed #ccc', 
                    borderRadius: '8px', 
                    padding: '2rem', 
                    textAlign: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ marginBottom: '1rem', color: '#666' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <div>Drag & drop your CSV file here or click to browse</div>
                    </div>
                    
                    <Button onClick={handleImportClick}>
                      Select CSV File
                    </Button>
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    <strong>CSV Format Example:</strong><br />
                    Name,Email,Other_Columns<br />
                    John Doe,john@example.com,X<br />
                    Jane Smith,jane@example.com,Y
                  </div>
                </div>
              )}
              
              {importMode === 'manual' && (
                <form onSubmit={handleAddStudentManually}>
                  <FormGroup>
                    <Label>Username or Email</Label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Input 
                        type="text" 
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="Enter student username or email address"
                        required
                        style={{ flex: 1 }}
                      />
                      <Button 
                        type="submit" 
                        disabled={importLoading || !usernameOrEmail.trim()}
                      >
                        {importLoading ? 'Adding...' : 'Add Student'}
                      </Button>
                    </div>
                  </FormGroup>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    This will add a single student to the class. The student must already be registered in the system.
                  </p>
                </form>
              )}
              
              {importMode === 'list' && (
                <div>
                  <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Students in this class ({classStudents.length})
                  </h4>
                  
                  {importLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>Loading students...</div>
                  ) : classStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#666' }}>
                      No students found in this class
                    </div>
                  ) : (
                    <div style={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      border: '1px solid #eee',
                      borderRadius: '8px' 
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ 
                            backgroundColor: '#f9f9f9',
                            position: 'sticky',
                            top: 0
                          }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>Name</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>Username</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #eee' }}>Email</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudents.map((student) => (
                            <tr key={student.id}>
                              <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                                {student.firstName} {student.lastName}
                              </td>
                              <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                                {student.username}
                              </td>
                              <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                                {student.email}
                              </td>
                              <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                <button
                                  onClick={() => handleRemoveStudent(student)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ff5757',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem'
                                  }}
                                  title="Remove from class"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {importError && (
                <div style={{ 
                  padding: '0.75rem', 
                  marginTop: '1rem',
                  backgroundColor: '#ffecec', 
                  color: '#ff5757',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  {importError}
                </div>
              )}
              
              {importSuccess && (
                <div style={{ 
                  padding: '0.75rem', 
                  marginTop: '1rem',
                  backgroundColor: '#ecffec', 
                  color: '#34a853',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  {importSuccess}
                </div>
              )}
            </div>
            
            <ButtonGroup>
              <Button variant="outlined" onClick={() => setShowImportModal(false)}>
                Close
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
      
      {/* Add logout confirmation modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleConfirmLogout}
        message="Are you sure you want to logout?"
      />
    </PageContainer>
  );
}

export default ClassPage;
