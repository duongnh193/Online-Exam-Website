import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';

// Styled Components
const ReportContainer = styled.div`
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

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.div`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  color: ${props => props.active ? '#6a00ff' : '#888'};
  font-weight: ${props => props.active ? '600' : '400'};
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.active ? '#6a00ff' : 'transparent'};
    border-radius: 3px 3px 0 0;
  }
  
  &:hover {
    color: #6a00ff;
  }
`;

const StatisticsCard = styled.div`
  background-color: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const StatTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #333;
`;

const StatSelectContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StatSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;
`;

const StatChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const COLORS = ['#6a00ff', '#ff2e8e', '#00c16e', '#f5a623'];

function ReportPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('examScores');
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [examScoreStats, setExamScoreStats] = useState(null);
  const [studentScores, setStudentScores] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        // Tải danh sách lớp học và bài thi giả
        // Trong thực tế, bạn sẽ cần API để lấy danh sách thực
        setClasses([
          { id: 1, name: 'Computer Science 101' },
          { id: 2, name: 'Database Systems' },
          { id: 3, name: 'Web Development' }
        ]);
        
        setExams([
          { id: 1, name: 'Midterm Exam' },
          { id: 2, name: 'Final Exam' },
          { id: 3, name: 'Quiz 1' }
        ]);
        
        // Đặt giá trị mặc định cho dropdown
        if (classes.length > 0) {
          setSelectedClassId(classes[0].id);
          loadExamsInClass(classes[0].id);
        }
        
        if (exams.length > 0) {
          setSelectedExamId(exams[0].id);
          loadExamStats(exams[0].id);
        }
      } catch (error) {
        console.error('Error loading report data:', error);
      }
    };
    
    loadReportData();
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

  // Tải thông tin bài thi trong lớp học được chọn
  const loadExamsInClass = async (classId) => {
    if (!classId) return;
    
    try {
      const examCountInClass = await dashboardService.getExamsInClass(classId);
      console.log(`Class ${classId} has ${examCountInClass} exams`);
      
      // Tải danh sách điểm của sinh viên trong lớp
      const scores = await dashboardService.getStudentScoresInClass(classId);
      setStudentScores(scores.content || []);
    } catch (error) {
      console.error('Error loading exams in class:', error);
    }
  };
  
  // Tải thống kê điểm số của bài thi được chọn
  const loadExamStats = async (examId) => {
    if (!examId) return;
    
    try {
      const stats = await dashboardService.getExamScoreStatistics(examId);
      setExamScoreStats(stats);
    } catch (error) {
      console.error('Error loading exam statistics:', error);
    }
  };
  
  // Xử lý khi người dùng chọn lớp học khác
  const handleClassChange = (e) => {
    const classId = parseInt(e.target.value);
    setSelectedClassId(classId);
    loadExamsInClass(classId);
  };
  
  // Xử lý khi người dùng chọn bài thi khác
  const handleExamChange = (e) => {
    const examId = parseInt(e.target.value);
    setSelectedExamId(examId);
    loadExamStats(examId);
  };

  // Dữ liệu biểu đồ thống kê điểm số
  const getScoreDistributionData = () => {
    if (!examScoreStats) return [];
    
    return [
      { name: 'Min Score', value: examScoreStats.minScore },
      { name: 'Avg Score', value: examScoreStats.avgScore },
      { name: 'Max Score', value: examScoreStats.maxScore }
    ];
  };
  
  // Dữ liệu biểu đồ phân bố điểm số sinh viên
  const getStudentScoreData = () => {
    if (!studentScores || studentScores.length === 0) return [];
    
    // Tạo một đối tượng chứa dữ liệu sinh viên
    return studentScores.map((student, index) => ({
      name: student.studentName,
      score: student.avgScore,
      scoreIn10: student.avgScoreIn10 || 0,
      scoreIn4: student.avgScoreIn4 || 0
    }));
  };

  const handleLogout = () => {
    setShowDropdown(false);
    setTimeout(() => {
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

  // Render exam statistics
  const renderExamStatistics = () => (
    <StatisticsCard>
      <StatHeader>
        <StatTitle>Exam Score Statistics</StatTitle>
        <StatSelectContainer>
          <StatSelect value={selectedExamId || ''} onChange={handleExamChange}>
            <option value="">Select Exam</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </StatSelect>
        </StatSelectContainer>
      </StatHeader>
      
      <StatChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getScoreDistributionData()} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="value" fill="#6a00ff">
              {getScoreDistributionData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </StatChartContainer>
      
      {examScoreStats && (
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: COLORS[0] }}>
              {examScoreStats.minScore.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Min Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: COLORS[1] }}>
              {examScoreStats.avgScore.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Average Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: COLORS[2] }}>
              {examScoreStats.maxScore.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Max Score</div>
          </div>
        </div>
      )}
    </StatisticsCard>
  );

  // Render student statistics
  const renderStudentScoreStatistics = () => (
    <StatisticsCard>
      <StatHeader>
        <StatTitle>Student Score Statistics</StatTitle>
        <StatSelectContainer>
          <StatSelect value={selectedClassId || ''} onChange={handleClassChange}>
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </StatSelect>
        </StatSelectContainer>
      </StatHeader>
      
      <StatChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getStudentScoreData()} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="scoreIn10" name="Score (scale 10)" fill="#ff2e8e" />
            <Bar dataKey="scoreIn4" name="Score (scale 4)" fill="#6a00ff" />
          </BarChart>
        </ResponsiveContainer>
      </StatChartContainer>
      
      {studentScores.length > 0 && (
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          {`Showing scores for ${studentScores.length} students in selected class`}
        </div>
      )}
    </StatisticsCard>
  );

  return (
    <ReportContainer>
      <Sidebar>
        <Logo>logo</Logo>
        <SidebarMenu>
          <NavItem to="/admin-dashboard">
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
          <NavItem to="/reports" className="active">
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
            <h1>Reports & Analytics</h1>
            <p>View detailed statistics and reports</p>
          </PageTitle>
          
          <HeaderRight>
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
        
        <TabContainer>
          <Tab 
            active={activeTab === 'examScores'} 
            onClick={() => setActiveTab('examScores')}
          >
            Exam Scores
          </Tab>
          <Tab 
            active={activeTab === 'studentScores'} 
            onClick={() => setActiveTab('studentScores')}
          >
            Student Scores
          </Tab>
        </TabContainer>
        
        {activeTab === 'examScores' ? renderExamStatistics() : renderStudentScoreStatistics()}
      </MainContent>
    </ReportContainer>
  );
}

export default ReportPage; 