import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import authService from '../services/authService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

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

function LecturerDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sortOption, setSortOption] = useState('recent');
  const [examCount, setExamCount] = useState(0);
  const [classCount, setClassCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load exam count
        const examCountData = await dashboardService.getExamCount();
        setExamCount(examCountData);
        
        // We could add a method to get class count for this lecturer
        // For now using a placeholder
        setClassCount(5); // placeholder
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
    console.log('LecturerDashboardPage: Initiating logout process');
    // Make sure the dropdowns are closed
    setShowDropdown(false);
    
    // Add a small delay to ensure state changes have time to propagate
    setTimeout(() => {
      console.log('LecturerDashboardPage: Executing logout');
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
            <NavItem to="/" onClick={handleLogout}>
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
              <CardValue>{examCount || 4}</CardValue>
              <ExpandButton />
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
              <CardValue>{classCount || 5}</CardValue>
              <ExpandButton />
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
      </DashboardContainer>
    </>
  );
}

export default LecturerDashboardPage; 