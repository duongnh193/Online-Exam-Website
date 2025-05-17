import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import authService from '../services/authService';
import classService from '../services/classService';
import examService from '../services/examService';
import { FaEllipsisV } from 'react-icons/fa';

// Styled Components
const DashboardContainer = styled.div`
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
  padding: 2rem;
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

const PageTitle = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    color: #333;
  }
  
  p {
    margin: 0;
    color: #888;
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
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  flex: 1;
  min-width: 280px;
  position: relative;
`;

const CardHeader = styled.div`
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.5rem;
`;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const ExpandButton = styled.div`
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
  
  &::before {
    content: '🔍';
    font-size: 14px;
    opacity: 0.6;
  }
`;

const ChartContainer = styled.div`
  height: 120px;
  margin-top: 1rem;
`;

// Add a color palette for card backgrounds
const CARD_COLORS = [
  '#43a047', // green
  '#6a1b9a', // purple
  '#00695c', // teal
  '#388e3c', // dark green
  '#fbc02d', // yellow
  '#0288d1', // blue
  '#8d6e63', // brown
  '#c62828', // red
  '#2e7d32', // forest green
  '#5d4037', // dark brown
];

function getRandomColor(index) {
  return CARD_COLORS[index % CARD_COLORS.length];
}

function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sortOption, setSortOption] = useState('recent');
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const [openMenuIdx, setOpenMenuIdx] = useState(null);
  const menuRefs = useRef([]);

  // Color palette for color picker
  const COLOR_PICKER = [
    '#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab',
    '#1e88e5', '#039be5', '#00acc1', '#00897b', '#43a047',
    '#7cb342', '#c0ca33', '#fbc02d', '#ffa000', '#fb8c00',
    '#f4511e', '#6d4c41', '#757575', '#546e7a', '#00bcd4',
  ];
  const [customColors, setCustomColors] = useState({});
  const [nicknames, setNicknames] = useState({});
  
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch student's classes
        const classesResponse = await classService.getStudentClasses(user.id);
        console.log('Classes response:', classesResponse);
        
        // Handle both paginated and non-paginated responses
        const classes = Array.isArray(classesResponse.data) 
          ? classesResponse.data 
          : (classesResponse.data.content || []);
          
        console.log('Processed classes:', classes);
        setMyClasses(classes);
        
        if (classes.length === 0) {
          setUpcomingExams([]);
          setCompletedExams([]);
          setLoading(false);
          return;
        }
        
        // Fetch upcoming exams for all classes
        const upcomingExamsPromises = classes.map(classItem => {
          console.log(`Fetching exams for class ID: ${classItem.id}, name: ${classItem.name || 'Unknown'}`);
          return examService.getExamsByClass(classItem.id);
        });
        
        const upcomingExamsResponses = await Promise.all(upcomingExamsPromises);
        const allUpcomingExams = upcomingExamsResponses.flatMap((response, index) => {
          // Get the class details for this response
          const classItem = classes[index];
          console.log(`Processing exams for class ${classItem.id} (${classItem.name || 'Unknown'})`);
          
          // Extract exams data with proper fallback handling
          const exams = Array.isArray(response.data) 
            ? response.data 
            : (response.data.content || []);
          
          // Map with class context and filter by status
          return exams
            .filter(exam => exam && typeof exam === 'object')
            .map(exam => {
              // Add classInfo to each exam object for display context
              const enhancedExam = {
                ...exam,
                // Ensure exam has a proper title
                title: exam.title || `Exam #${exam.id || 0}`,
                // Add class information to the exam
                classInfo: {
                  id: classItem.id,
                  name: classItem.name || `Class #${classItem.id}`
                }
              };
              console.log(`Processed exam: ${enhancedExam.id}, title: "${enhancedExam.title}"`);
              return enhancedExam;
            })
            .filter(exam => 
              exam.status === 'SCHEDULED' || exam.status === 'ONGOING'
            );
        });
        
        // Sort by start time
        allUpcomingExams.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
        console.log(`Total upcoming exams after processing: ${allUpcomingExams.length}`);
        setUpcomingExams(allUpcomingExams);
        
        // Fetch completed exams
        const completedExamsPromises = classes.map(classItem => {
          console.log(`Fetching completed exams for class ID: ${classItem.id}`);
          return examService.getExamsByClass(classItem.id);
        });
        
        const completedExamsResponses = await Promise.all(completedExamsPromises);
        const allCompletedExams = completedExamsResponses.flatMap((response, index) => {
          // Get the class details for this response
          const classItem = classes[index];
          console.log(`Processing completed exams for class ${classItem.id} (${classItem.name || 'Unknown'})`);
          
          // Extract exams data with proper fallback handling
          const exams = Array.isArray(response.data) 
            ? response.data 
            : (response.data.content || []);
          
          // Map with class context and filter by status
          return exams
            .filter(exam => exam && typeof exam === 'object')
            .map(exam => {
              // Add classInfo to each exam object for display context
              const enhancedExam = {
                ...exam,
                // Ensure exam has a proper title
                title: exam.title || `Exam #${exam.id || 0}`,
                // Add class information to the exam
                classInfo: {
                  id: classItem.id,
                  name: classItem.name || `Class #${classItem.id}`
                }
              };
              return enhancedExam;
            })
            .filter(exam => exam.status === 'COMPLETED');
        });
        
        // Sort by completion time
        allCompletedExams.sort((a, b) => new Date(b.endAt) - new Date(a.endAt));
        setCompletedExams(allCompletedExams);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);
  
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
      if (openMenuIdx !== null) {
        const menuRef = menuRefs.current[openMenuIdx];
        if (menuRef && !menuRef.contains(event.target)) {
          setOpenMenuIdx(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuIdx]);
  
  const upcomingExamsData = [
    { name: 'Mon', count: upcomingExams.filter(e => new Date(e.startAt).getDay() === 1).length },
    { name: 'Tue', count: upcomingExams.filter(e => new Date(e.startAt).getDay() === 2).length },
    { name: 'Wed', count: upcomingExams.filter(e => new Date(e.startAt).getDay() === 3).length },
    { name: 'Thu', count: upcomingExams.filter(e => new Date(e.startAt).getDay() === 4).length },
    { name: 'Fri', count: upcomingExams.filter(e => new Date(e.startAt).getDay() === 5).length },
    { name: 'Sat', count: upcomingExams.filter(e => new Date(e.startAt).getDay() === 6).length },
    { name: 'Sun', count: upcomingExams.filter(e => new Date(e.startAt).getDay() === 0).length }
  ];
  
  const completedExamsData = [
    { name: 'Mon', count: completedExams.filter(e => new Date(e.endAt).getDay() === 1).length },
    { name: 'Tue', count: completedExams.filter(e => new Date(e.endAt).getDay() === 2).length },
    { name: 'Wed', count: completedExams.filter(e => new Date(e.endAt).getDay() === 3).length },
    { name: 'Thu', count: completedExams.filter(e => new Date(e.endAt).getDay() === 4).length },
    { name: 'Fri', count: completedExams.filter(e => new Date(e.endAt).getDay() === 5).length },
    { name: 'Sat', count: completedExams.filter(e => new Date(e.endAt).getDay() === 6).length },
    { name: 'Sun', count: completedExams.filter(e => new Date(e.endAt).getDay() === 0).length }
  ];
  
  const handleLogout = () => {
    console.log('StudentDashboardPage: Initiating logout process');
    // Make sure the dropdowns are closed
    setShowDropdown(false);
    
    // Add a small delay to ensure state changes have time to propagate
    setTimeout(() => {
      console.log('StudentDashboardPage: Executing logout');
      logout();
    }, 100);
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
      case 'results': return '📊';
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

  const handleMenuOpen = (idx) => setOpenMenuIdx(idx);
  const handleMenuClose = () => setOpenMenuIdx(null);
  const handleColorChange = (classId, color) => {
    setCustomColors(prev => ({ ...prev, [classId]: color }));
    setOpenMenuIdx(null);
  };
  const handleNicknameChange = (classId, value) => {
    setNicknames(prev => ({ ...prev, [classId]: value }));
  };

  // Function to check if a route is active
  const isRouteActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <Logo>logo</Logo>
        <SidebarMenu>
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
          <PageTitle>
            <h1>Student Dashboard</h1>
            <p>Welcome back, {getFullName()}</p>
          </PageTitle>
          
          <HeaderRight>
            <SortDropdown 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="recent">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </SortDropdown>
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
        
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading dashboard data...
          </div>
        ) : (
          <>
            {/* Stats Cards with Charts */}
            <CardsContainer>
              <Card>
                <CardHeader>Completed Exams</CardHeader>
                <CardValue>{completedExams.length}</CardValue>
                <ExpandButton onClick={() => navigate('/results')} />
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={completedExamsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCompletedExams" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6a00ff" stopOpacity={1} />
                          <stop offset="100%" stopColor="#9c27b0" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide={true} />
                      <YAxis hide={true} />
                      <Tooltip cursor={false} />
                      <Bar dataKey="count" fill="url(#colorCompletedExams)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>

              <Card>
                <CardHeader>Upcoming Exams</CardHeader>
                <CardValue>{upcomingExams.length}</CardValue>
                <ExpandButton onClick={() => navigate(`/student-exams`)} />
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={upcomingExamsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUpcomingExams" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff4081" stopOpacity={1} />
                          <stop offset="100%" stopColor="#f06292" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide={true} />
                      <YAxis hide={true} />
                      <Tooltip cursor={false} />
                      <Bar dataKey="count" fill="url(#colorUpcomingExams)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </Card>
            </CardsContainer>

            {/* My Classes Section (cards) */}
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>My Classes</h2>
              {myClasses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '1rem' }}>
                  You are not enrolled in any classes yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {myClasses.map((classItem, idx) => {
                    const color = customColors[classItem.id] || getRandomColor(idx);
                    return (
                      <div
                        key={classItem.id}
                        style={{
                          borderRadius: '1rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          background: 'white',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          minHeight: '200px',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.1s',
                        }}
                        onClick={e => {
                          // Only prevent navigation if clicking on the menu button or menu is open
                          if (e.target === menuRefs.current[idx] || 
                              (menuRefs.current[idx] && menuRefs.current[idx].contains(e.target))) {
                            return;
                          }
                          navigate(`/exams?classId=${classItem.id}`);
                        }}
                      >
                        {/* Top colored section with 3-dot menu */}
                        <div style={{
                          background: color,
                          height: '50%',
                          minHeight: '70px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'flex-end',
                          padding: '0.5rem 0.5rem 0 0',
                        }}>
                          <div
                            style={{ cursor: 'pointer', zIndex: 2 }}
                            onClick={e => { e.stopPropagation(); handleMenuOpen(idx); }}
                          >
                            <FaEllipsisV color="#fff" size={20} />
                          </div>
                          {/* Popover menu */}
                          {openMenuIdx === idx && (
                            <div
                              ref={el => (menuRefs.current[idx] = el)}
                              style={{
                                position: 'absolute',
                                top: '2.2rem',
                                right: '0.5rem',
                                background: '#fff',
                                borderRadius: '8px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                                padding: '1rem',
                                minWidth: '180px',
                                zIndex: 10,
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: '1rem' }}>Color</span>
                                <span style={{ cursor: 'pointer', fontSize: 18, color: '#888' }} onClick={handleMenuClose}>×</span>
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                                {COLOR_PICKER.map(c => (
                                  <div
                                    key={c}
                                    style={{
                                      width: 22, height: 22, borderRadius: 4, background: c,
                                      border: color === c ? '2px solid #333' : '1px solid #eee',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleColorChange(classItem.id, c)}
                                  />
                                ))}
                              </div>
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>Nickname</div>
                                <input
                                  type="text"
                                  value={nicknames[classItem.id] || ''}
                                  onChange={e => handleNicknameChange(classItem.id, e.target.value)}
                                  style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
                                  placeholder="Enter nickname"
                                />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button type="button" style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }} onClick={handleMenuClose}>Cancel</button>
                                <button type="button" style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: '#1976d2', color: '#fff', cursor: 'pointer' }} onClick={handleMenuClose}>Apply</button>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Bottom white section with left-aligned text */}
                        <div style={{
                          flex: 1,
                          background: 'white',
                          padding: '1rem 1.2rem 1.2rem 1.2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'flex-start',
                          textAlign: 'left',
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {nicknames[classItem.id] || classItem.name || classItem.title}
                          </div>
                          <div style={{ fontSize: '0.95rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {classItem.description || 'No description available'}
                          </div>
                        </div>
                        {/* Add "View Exams" button */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          marginTop: 'auto',
                          padding: '0.75rem 1rem',
                        }}>
                          <button
                            style={{
                              background: '#6a00ff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '20px',
                              padding: '0.4rem 0.75rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/exams?classId=${classItem.id}`);
                            }}
                          >
                            <span>View Exams</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </MainContent>
    </DashboardContainer>
  );
}

export default StudentDashboardPage; 