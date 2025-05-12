import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import authService from '../services/authService';

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
  margin-bottom: 2rem;
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

const TabContainer = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.div`
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: ${props => props.active ? 600 : 400};
  color: ${props => props.active ? '#6a00ff' : '#666'};
  cursor: pointer;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${props => props.active ? '#6a00ff' : 'transparent'};
  }
  
  &:hover {
    color: ${props => props.active ? '#6a00ff' : '#333'};
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1.5rem;
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
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  color: #666;
  font-weight: 600;
  font-size: 0.9rem;
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

const ActionCell = styled.td`
  padding: 1rem 1.5rem;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
`;

const ActionButton = styled.button`
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

const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    // Normalize role for consistent comparison
    const role = props.role?.toUpperCase();
    switch (role) {
      case 'ROLE_ADMIN': case 'ADMIN': return '#ffecec';
      case 'ROLE_LECTURER': case 'LECTURER': return '#ecf5ff';
      case 'ROLE_STUDENT': case 'STUDENT': return '#ecffec';
      default: return '#f0f0f0';
    }
  }};
  color: ${props => {
    // Normalize role for consistent comparison
    const role = props.role?.toUpperCase();
    switch (role) {
      case 'ROLE_ADMIN': case 'ADMIN': return '#ff5757';
      case 'ROLE_LECTURER': case 'LECTURER': return '#4285f4';
      case 'ROLE_STUDENT': case 'STUDENT': return '#34a853';
      default: return '#666';
    }
  }};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #6a00ff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23333' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  
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
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 500px;
  max-width: 90%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
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

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 30px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #6a00ff;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ColumnContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const Column = styled.div`
  flex: 1;
`;

const ColumnTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => props.role === 'ROLE_LECTURER' ? '#ecf5ff' : '#ecffec'};
    color: ${props => props.role === 'ROLE_LECTURER' ? '#4285f4' : '#34a853'};
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
    font-weight: 600;
  }
`;

// SVG icons
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

function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation(); // Add location hook for routing
  const [activeTab, setActiveTab] = useState('profile');
  const [showDropdown, setShowDropdown] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_STUDENT'
  });
  const dropdownRef = useRef(null);
  
  // User profile update
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: ''
  });
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);
  
  // Add a ref to track if a fetch is already in progress
  const isFetchingRef = useRef(false);
  const usersLoadedRef = useRef(false);

  // Add state for error message and success state in the password section
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Add state for 2FA status messages
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');

  // Add a function to explicitly update the 2FA UI state from localStorage
  const updateTwoFactorStateFromStorage = useCallback(() => {
    const is2FAEnabled = authService.is2FAEnabled();
    console.log('Updating 2FA UI state from storage, current status:', is2FAEnabled);
    setTwoFactorEnabled(is2FAEnabled);
  }, []);
  
  // Memoize refreshUser to prevent it from changing on each render
  const memoizedRefreshUser = useCallback(async () => {
    console.log('Memoized refreshUser called');
    try {
      await refreshUser();
      // After refreshing user data, update the 2FA state from storage
      updateTwoFactorStateFromStorage();
      return true;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return false;
    }
  }, [refreshUser, updateTwoFactorStateFromStorage]);
  
  // Updated useEffect with proper dependency array
  useEffect(() => {
    // Refresh user data when component mounts
    memoizedRefreshUser();
    
    // Always update 2FA state directly from storage on mount
    updateTwoFactorStateFromStorage();
    
    // Check for global cache reset flag
    if (window.__resetUserDataCache) {
      console.log('Detected cache reset flag, will refresh users');
      usersLoadedRef.current = false;
      window.__resetUserDataCache = false;
    }
    
    // Only fetch users if the user is an admin and we haven't loaded users yet
    if (user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_LECTURER') && !usersLoadedRef.current) {
      console.log('Initial fetch of users triggered');
      fetchUsers();
    }
    
    // Test API connection on component mount
    async function testConnection() {
      try {
        console.log('Testing API connection...');
        const result = await userService.testApiConnection();
        console.log('API connection test result:', result);
      } catch (error) {
        console.error('API connection test failed:', error);
      }
    }
    
    testConnection();
    
    // Cleanup function
    return () => {
      console.log('Settings page unmounted, resetting fetch state');
      isFetchingRef.current = false;
      // Don't reset usersLoadedRef here to avoid refetching when component remounts
    };
  }, [memoizedRefreshUser, updateTwoFactorStateFromStorage]);

  // Also update the 2FA state whenever the tab changes to 'twofa'
  useEffect(() => {
    if (activeTab === 'twofa') {
      updateTwoFactorStateFromStorage();
    }
  }, [activeTab, updateTwoFactorStateFromStorage]);

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
  
  useEffect(() => {
    if (user && activeTab === 'profile') {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
  }, [user, activeTab]);
  
  const fetchUsers = async (forceRefresh = false) => {
    // Don't fetch if already fetching or if we already have users and not forcing refresh
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping duplicate call');
      return;
    }
    
    if (users.length > 0 && !forceRefresh && usersLoadedRef.current) {
      console.log('Using cached users list, set forceRefresh=true to reload');
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching users from API...');
      
      // Debug auth headers
      console.log('Auth headers:', authService.getAuthHeader());
      console.log('User data in localStorage:', localStorage.getItem('user'));
      console.log('Token in localStorage:', localStorage.getItem('token')?.substring(0, 10) + '...');
      
      // Create promises for fetching different user roles
      console.log('Fetching admin users...');
      const adminPromise = userService.getAllAdmins();
      
      console.log('Fetching lecturer users...');
      const lecturerPromise = userService.getAllLecturers();
      
      console.log('Fetching student users...');
      const studentPromise = userService.getAllStudents();
      
      // Wait for all promises to resolve
      const [adminResponse, lecturerResponse, studentResponse] = await Promise.all([
        adminPromise, lecturerPromise, studentPromise
      ]);
      
      console.log('Admin response:', adminResponse);
      console.log('Lecturer response:', lecturerResponse);
      console.log('Student response:', studentResponse);
      
      // Extract data from each response and combine into a single array
      console.log('Admin response structure:', {
        hasData: !!adminResponse.data,
        hasContent: !!(adminResponse.data && adminResponse.data.content),
        isArray: Array.isArray(adminResponse.data),
        dataKeys: adminResponse.data ? Object.keys(adminResponse.data) : [],
        firstItem: adminResponse.data?.content?.[0] || (Array.isArray(adminResponse.data) ? adminResponse.data[0] : null)
      });
      
      // Handle various response formats safely
      let adminUsers = [];
      let lecturerUsers = [];
      let studentUsers = [];
      
      // Safely extract admin users
      if (adminResponse.data) {
        if (adminResponse.data.content && Array.isArray(adminResponse.data.content)) {
          adminUsers = adminResponse.data.content;
        } else if (Array.isArray(adminResponse.data)) {
          adminUsers = adminResponse.data;
        } else if (typeof adminResponse.data === 'object') {
          // Handle case where response is a single object
          adminUsers = [adminResponse.data];
        }
      }
      
      // Safely extract lecturer users
      if (lecturerResponse.data) {
        if (lecturerResponse.data.content && Array.isArray(lecturerResponse.data.content)) {
          lecturerUsers = lecturerResponse.data.content;
        } else if (Array.isArray(lecturerResponse.data)) {
          lecturerUsers = lecturerResponse.data;
        } else if (typeof lecturerResponse.data === 'object') {
          lecturerUsers = [lecturerResponse.data];
        }
      }
      
      // Safely extract student users
      if (studentResponse.data) {
        if (studentResponse.data.content && Array.isArray(studentResponse.data.content)) {
          studentUsers = studentResponse.data.content;
        } else if (Array.isArray(studentResponse.data)) {
          studentUsers = studentResponse.data;
        } else if (typeof studentResponse.data === 'object') {
          studentUsers = [studentResponse.data];
        }
      }
      
      const allUsers = [
        ...adminUsers,
        ...lecturerUsers,
        ...studentUsers
      ];
      
      console.log('Users extracted:', {
        adminUsers: adminUsers.length,
        lecturerUsers: lecturerUsers.length,
        studentUsers: studentUsers.length,
        total: allUsers.length
      });
      
      console.log('Users received:', allUsers);
      
      // Verify users have required properties
      if (allUsers.length > 0) {
        const sampleUser = allUsers[0];
        console.log('Sample user structure:', {
          hasId: 'id' in sampleUser,
          hasUsername: 'username' in sampleUser,
          hasEmail: 'email' in sampleUser,
          hasRole: 'role' in sampleUser,
          allKeys: Object.keys(sampleUser)
        });
      } else {
        console.warn('No users were found or extracted from the API responses');
      }
      
      setUsers(allUsers);
      usersLoadedRef.current = true;
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError(`Failed to load users: ${error.message}`);
      
      // No more mock data fallback
      setUsers([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };
  
  const handleLogout = () => {
    logout();
  };
  
  const getUserInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'J';
  };

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

  // For students, only show profile and security tabs
  useEffect(() => {
    if (isStudent && activeTab === 'users') {
      setActiveTab('profile');
    }
  }, [isStudent, activeTab]);

  const openCreateModal = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      role: 'ROLE_STUDENT'
    });
    setModalMode('create');
    setShowModal(true);
  };
  
  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '',
      confirmPassword: '',
      role: user.role
    });
    setModalMode('edit');
    setShowModal(true);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        // Create new user
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
        
        // Map form data to SignupRequest format
        const signupRequest = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          role: formData.role
        };
        
        await userService.createUser(signupRequest);
        alert('User created successfully');
      } else {
        // Update existing user
        // Map form data to UpdateUserRequest format
        const updateUserRequest = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        };
        
        await userService.updateUser(currentUser.id, updateUserRequest);
        
        // If role has changed, update it separately
        if (currentUser.role !== formData.role) {
          await userService.updateRole(currentUser.id, formData.role);
        }
        
        // If password is provided, update it
        if (formData.password) {
          if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
          }
          
          const passwordUpdateRequest = {
            currentPassword: formData.currentPassword || "password", // This is a workaround for the demo
            newPassword: formData.password
          };
          
          await userService.updatePassword(currentUser.id, passwordUpdateRequest);
        }
        
        alert('User updated successfully');
      }
      
      // Refresh users list with force refresh and close modal
      fetchUsers(true);
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.response?.data?.message || 'Something went wrong'}`);
    }
  };
  
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await userService.deleteUser(userId);
        alert('User deleted successfully');
        fetchUsers(true); // Force refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Error: ${error.response?.data?.message || 'Failed to delete user'}`);
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter users by search term and role
  // Normalize role values to handle potential format variations
  const normalizeRole = (role) => {
    if (!role) return '';
    // Ensure ROLE_ prefix is present
    const normalizedRole = role.toUpperCase().startsWith('ROLE_') 
      ? role.toUpperCase() 
      : `ROLE_${role.toUpperCase()}`;
    return normalizedRole;
  };
  
  const filteredLecturers = users.filter(user => 
    normalizeRole(user.role) === 'ROLE_LECTURER' && 
    (user.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredStudents = users.filter(user => 
    normalizeRole(user.role) === 'ROLE_STUDENT' && 
    (user.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredAdmins = users.filter(user => 
    normalizeRole(user.role) === 'ROLE_ADMIN' && 
    (user.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      alert('User information not available');
      return;
    }
    
    try {
      const updateRequest = {
        username: user.username,
        email: user.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName
      };
      
      const response = await userService.updateUser(user.id, updateRequest);
      
      // Update local user state
      const updatedUser = {
        ...user,
        firstName: profileData.firstName,
        lastName: profileData.lastName
      };
      
      // You may need to update the auth context if it stores user details
      // updateUser(updatedUser);
      
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to update profile'}`);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      setPasswordError('User information not available');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    setPasswordError('');
    setPasswordSuccess(false);
    setIsPasswordLoading(true);
    
    try {
      console.log('Submitting password change request using auth service...');
      
      // Use the auth service method to update password
      await authService.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Show success message
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Display specific error message
      let errorMessage = '';
      
      if (error.message) {
        // Check for network connectivity issues
        if (error.message.includes('Network Error')) {
          errorMessage = 'Cannot connect to the server. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again later.';
        } else if (error.message.includes('Internal Server Error') || 
                  error.message.includes('500')) {
          errorMessage = 'The server encountered an error. Please contact support.';
        } else {
          // Use the error message from the service
          errorMessage = error.message;
        }
      } else {
        errorMessage = 'Failed to update password';
      }
      
      setPasswordError(errorMessage);
      console.error('Server response:', error.message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    if (!user || !user.id) {
      setTwoFactorError('User information not available');
      return;
    }
    
    // Reset status messages
    setTwoFactorError('');
    setTwoFactorSuccess('');
    
    try {
      setUpdating2FA(true);
      // Toggle the current state
      const newTwoFAState = !twoFactorEnabled;
      
      // Call the API to update 2FA using authService
      let response;
      if (newTwoFAState) {
        console.log('Enabling 2FA for user:', user.username);
        response = await authService.enable2FA();
        console.log('Enabling 2FA response:', response);
      } else {
        console.log('Disabling 2FA for user:', user.username);
        response = await authService.disable2FA();
        console.log('Disabling 2FA response:', response);
      }
      
      // Update the local state
      setTwoFactorEnabled(newTwoFAState);
      
      // Show success message
      setTwoFactorSuccess(`Two-factor authentication has been ${newTwoFAState ? 'enabled' : 'disabled'}`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setTwoFactorSuccess(''), 5000);
      
      // Refresh the user object to ensure it has the updated 2FA status
      await memoizedRefreshUser();
      
      // Double check local storage was updated correctly
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User data after 2FA update:', {
        twoFactorEnabled: userData.twoFactorEnabled,
        twoFactor: userData.twoFactor
      });
    } catch (error) {
      console.error('Error updating 2FA:', error);
      
      // Set error message based on the type of error
      let errorMessage = 'Failed to update two-factor authentication';
      
      if (error.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = 'Cannot connect to the server. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again later.';
        } else if (error.message.includes('500')) {
          errorMessage = 'The server encountered an error. Please try again later.';
        } else {
          // Use the error message from the service
          errorMessage = error.message;
        }
      }
      
      setTwoFactorError(errorMessage);
      
      // Make sure UI state is refreshed to match actual state
      const actualState = authService.is2FAEnabled();
      if (twoFactorEnabled !== actualState) {
        console.log('Correcting 2FA UI state to match actual state:', actualState);
        setTwoFactorEnabled(actualState);
      }
    } finally {
      setUpdating2FA(false);
    }
  };

  // Function to check if a route is active
  const isRouteActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <PageContainer>
      <Sidebar>
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
              <NavItem to="/payment" className={isRouteActive('/payment') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('payment')}</NavIcon>
                Payment
              </NavItem>
              <NavItem to="/users" className={isRouteActive('/users') ? 'active' : ''}>
                <NavIcon>{getMenuIcon('users')}</NavIcon>
                Users
              </NavItem>
            </>
          )}
        </SidebarMenu>
        <BottomMenu>
          <NavItem to="/settings" className={isRouteActive('/settings') ? 'active' : ''}>
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
          <PageTitle>Settings</PageTitle>
          
          <HeaderRight>
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
        
        <TabContainer>
          {isAdmin && (
            <Tab 
              data-active={activeTab === 'users'} 
              active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')}
            >
              User Management
            </Tab>
          )}
          <Tab 
            data-active={activeTab === 'profile'} 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </Tab>
          <Tab 
            data-active={activeTab === 'security'} 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
          >
            Security
          </Tab>
          {(isStudent || isLecturer) && (
            <Tab 
              data-active={activeTab === 'twofa'} 
              active={activeTab === 'twofa'} 
              onClick={() => setActiveTab('twofa')}
            >
              Two-Factor Authentication
            </Tab>
          )}
        </TabContainer>
        
        {activeTab === 'users' && isAdmin && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle>User Management</CardTitle>
              <Button onClick={openCreateModal}>
                + Create User
              </Button>
            </div>
            
            <SearchContainer>
              <SearchIcon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </SearchIcon>
              <SearchInput 
                type="text" 
                placeholder="Search by username..." 
                value={searchTerm}
                onChange={handleSearch}
              />
            </SearchContainer>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#ff3e3e' }}>{error}</div>
            ) : (
              <>
                {filteredAdmins.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <ColumnTitle role="ROLE_ADMIN">
                      <span>{filteredAdmins.length}</span>
                      Admin Users
                    </ColumnTitle>
                    <Table>
                      <thead>
                        <tr>
                          <TableHeader>Username</TableHeader>
                          <TableHeader>Name</TableHeader>
                          <TableHeader>Email</TableHeader>
                          <TableHeader>Role</TableHeader>
                          <TableHeader></TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdmins.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || '-'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <RoleBadge role={user.role}>
                                {user.role.replace('ROLE_', '')}
                              </RoleBadge>
                            </TableCell>
                            <ActionCell>
                              <ActionButton title="Edit" onClick={() => openEditModal(user)}>
                                <EditIcon />
                              </ActionButton>
                              <ActionButton title="Delete" onClick={() => handleDelete(user.id)}>
                                <DeleteIcon />
                              </ActionButton>
                            </ActionCell>
                          </TableRow>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}

                <ColumnContainer>
                  <Column>
                    <ColumnTitle role="ROLE_LECTURER">
                      <span>{filteredLecturers.length}</span>
                      Lecturers
                    </ColumnTitle>
                    <Table>
                      <thead>
                        <tr>
                          <TableHeader>Username</TableHeader>
                          <TableHeader>Name</TableHeader>
                          <TableHeader></TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLecturers.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || '-'}</TableCell>
                            <ActionCell>
                              <ActionButton title="Edit" onClick={() => openEditModal(user)}>
                                <EditIcon />
                              </ActionButton>
                              <ActionButton title="Delete" onClick={() => handleDelete(user.id)}>
                                <DeleteIcon />
                              </ActionButton>
                            </ActionCell>
                          </TableRow>
                        ))}
                        {filteredLecturers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan="3" style={{ textAlign: 'center' }}>No lecturers found</TableCell>
                          </TableRow>
                        )}
                      </tbody>
                    </Table>
                  </Column>
                  
                  <Column>
                    <ColumnTitle role="ROLE_STUDENT">
                      <span>{filteredStudents.length}</span>
                      Students
                    </ColumnTitle>
                    <Table>
                      <thead>
                        <tr>
                          <TableHeader>Username</TableHeader>
                          <TableHeader>Name</TableHeader>
                          <TableHeader></TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map(user => (
                          <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || '-'}</TableCell>
                            <ActionCell>
                              <ActionButton title="Edit" onClick={() => openEditModal(user)}>
                                <EditIcon />
                              </ActionButton>
                              <ActionButton title="Delete" onClick={() => handleDelete(user.id)}>
                                <DeleteIcon />
                              </ActionButton>
                            </ActionCell>
                          </TableRow>
                        ))}
                        {filteredStudents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan="3" style={{ textAlign: 'center' }}>No students found</TableCell>
                          </TableRow>
                        )}
                      </tbody>
                    </Table>
                  </Column>
                </ColumnContainer>
              </>
            )}
          </Card>
        )}
        
        {activeTab === 'profile' && (
          <Card>
            <CardTitle>My Profile</CardTitle>
            <form onSubmit={handleProfileSubmit}>
              <FormGroup>
                <Label>Username</Label>
                <Input 
                  type="text" 
                  value={user?.username || ''} 
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                />
              </FormGroup>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label>First Name</Label>
                  <Input 
                    type="text" 
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                  />
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Last Name</Label>
                  <Input 
                    type="text" 
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                  />
                </FormGroup>
              </div>
              
              <ButtonGroup>
                <Button variant="outlined" type="button">Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </ButtonGroup>
            </form>
          </Card>
        )}
        
        {activeTab === 'security' && (
          <Card>
            <CardTitle>Change Password</CardTitle>
            <form onSubmit={handlePasswordSubmit}>
              {passwordError && (
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: '#ffebee', 
                  color: '#d32f2f',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: '#e8f5e9', 
                  color: '#388e3c',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  Password updated successfully!
                </div>
              )}

              <FormGroup>
                <Label>Current Password</Label>
                <Input 
                  type="password" 
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>New Password</Label>
                <Input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Confirm New Password</Label>
                <Input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </FormGroup>
              
              <ButtonGroup>
                <Button 
                  variant="outlined" 
                  type="button" 
                  onClick={() => {
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordError('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </ButtonGroup>
            </form>

            {/* Debug panel - only visible in development */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f8f8', borderRadius: '8px', fontSize: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '14px' }}>Debug Info (Dev Only)</h4>
                <div>
                  <strong>API Status:</strong> 
                  <button 
                    onClick={async () => {
                      try {
                        await userService.testApiConnection();
                        alert('API Connection: SUCCESS');
                      } catch (error) {
                        alert(`API Connection: FAILED - ${error.message}`);
                      }
                    }}
                    style={{ 
                      marginLeft: '0.5rem', 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#6a00ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Test Connection
                  </button>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Token:</strong> {localStorage.getItem('token')?.substring(0, 15)}...
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Token Type:</strong> {localStorage.getItem('token_type') || 'Bearer'}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>User ID:</strong> {user?.id}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Backend Fix:</strong> Using fallback method that bypasses backend password comparison
                </div>
              </div>
            )}
          </Card>
        )}
        
        {activeTab === 'twofa' && (isStudent || isLecturer) && (
          <Card>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Two-factor authentication adds an extra layer of security to your account. 
              When enabled, you'll need to provide a verification code in addition to your password when signing in.
            </p>
            
            {twoFactorError && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#ffebee', 
                color: '#d32f2f',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                {twoFactorError}
              </div>
            )}
            
            {twoFactorSuccess && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#e8f5e9', 
                color: '#388e3c',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                {twoFactorSuccess}
              </div>
            )}
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {twoFactorEnabled ? '2FA is currently enabled' : '2FA is currently disabled'}
                </h3>
                <p style={{ color: '#666', margin: 0 }}>
                  {twoFactorEnabled 
                    ? 'You will be asked for a verification code when logging in.' 
                    : 'Enable 2FA to add an extra layer of security to your account.'}
                </p>
              </div>
              <Button 
                onClick={handle2FAToggle}
                disabled={updating2FA}
                variant={twoFactorEnabled ? 'outlined' : undefined}
              >
                {updating2FA ? 'Updating...' : (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
              </Button>
            </div>
            
            {twoFactorEnabled && (
              <div style={{ padding: '1rem', backgroundColor: '#ecf5ff', borderRadius: '0.5rem' }}>
                <p style={{ margin: 0, color: '#4285f4' }}>
                  <strong>Note:</strong> When signing in, you'll need to enter a verification code that will be sent to your email address.
                </p>
              </div>
            )}
            
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>About Two-Factor Authentication</h3>
              <ul style={{ color: '#666', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Two-factor authentication requires you to verify your identity using two different factors: your password and a verification code.</li>
                <li style={{ marginBottom: '0.5rem' }}>When enabled, you'll receive a verification code via email each time you log in.</li>
                <li style={{ marginBottom: '0.5rem' }}>This helps protect your account even if your password is compromised.</li>
              </ul>
            </div>
          </Card>
        )}
      </MainContent>
      
      {showModal && !isStudent && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? 'Create User' : 'Edit User'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Username</Label>
                <Input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label>First Name</Label>
                  <Input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Last Name</Label>
                  <Input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </FormGroup>
              </div>
              <FormGroup>
                <Label>Role</Label>
                <Select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="ROLE_STUDENT">Student</option>
                  <option value="ROLE_LECTURER">Lecturer</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>{modalMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}</Label>
                <Input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={modalMode === 'create'}
                />
              </FormGroup>
              <FormGroup>
                <Label>Confirm Password</Label>
                <Input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={modalMode === 'create' || formData.password.length > 0}
                />
              </FormGroup>
              
              <ButtonGroup>
                <Button type="button" variant="outlined" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
}

export default SettingsPage; 