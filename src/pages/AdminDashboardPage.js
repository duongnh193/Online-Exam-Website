import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';

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
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CardRow = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  flex: 1;
  min-width: 250px;
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
  color: ${props => props.color || '#333'};
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

function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [sortOption, setSortOption] = useState('recent');
  const [examCount, setExamCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [classCount, setClassCount] = useState(0);
  const [lecturerCount, setLecturerCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Lấy dữ liệu thống kê từ các API
        const studentCountData = await dashboardService.getStudentCount();
        const classCountData = await dashboardService.getClassCount();
        const lecturerCountData = await dashboardService.getLecturerCount();
        
        // Cập nhật state với dữ liệu từ API
        setStudentCount(studentCountData);
        setClassCount(classCountData);
        setLecturerCount(lecturerCountData);
        
        // Vẫn giữ examCount như cũ vì không có API riêng
        const examCountData = await dashboardService.getExamCount();
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
    
    // Add a small delay to ensure state changes have time to propagate
    setTimeout(() => {
      console.log('AdminDashboardPage: Executing logout');
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
      case 'payment': return '💳';
      case 'users': return '👥';
      case 'settings': return '⚙️';
      case 'signout': return '🚪';
      default: return '•';
    }
  };

  return (
    <DashboardContainer>
      <Sidebar>
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
          <NavItem to="/payment">
            <NavIcon>{getMenuIcon('payment')}</NavIcon>
            Payment
          </NavItem>
          <NavItem to="/users">
            <NavIcon>{getMenuIcon('users')}</NavIcon>
            Users
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
            <h1>Admin Dashboard</h1>
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
              <ExpandButton />
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
              <ExpandButton />
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
              <CardHeader>Total Classes</CardHeader>
              <CardValue color="#00c16e">{classCount || 0}</CardValue>
              <ExpandButton />
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
        
        {/* Đã di chuyển các biểu đồ thống kê sang ReportPage.js */}
      </MainContent>
    </DashboardContainer>
  );
}

export default AdminDashboardPage; 