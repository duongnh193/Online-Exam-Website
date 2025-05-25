import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import classService from '../services/classService';
import examService from '../services/examService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';

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
    --sidebar-text: #ffffff;
    --sidebar-text-secondary: rgba(255, 255, 255, 0.8);
    --sidebar-active-bg: rgba(255, 255, 255, 0.1);
    --sidebar-hover-bg: rgba(255, 255, 255, 0.05);
    --sidebar-active-indicator: #ffffff;
    --primary-color: #6a00ff;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --card-bg: #ffffff;
    --hover-bg: #f5f5f5;
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
    --sidebar-text: #ffffff;
    --sidebar-text-secondary: rgba(255, 255, 255, 0.7);
    --sidebar-active-bg: rgba(255, 255, 255, 0.1);
    --sidebar-hover-bg: rgba(255, 255, 255, 0.05);
    --sidebar-active-indicator: #ffffff;
    --primary-color: #8d47ff;
    --shadow-color: rgba(0, 0, 0, 0.3);
    --card-bg: #2a2a2a;
    --hover-bg: #404040;
  }
`;

// Styled Components
const ReportContainer = styled.div`
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
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
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
  background-color: var(--primary-color);
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
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-color);
  width: 180px;
  z-index: 100;
  overflow: hidden;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
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
    background-color: var(--hover-bg);
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

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
`;

const Tab = styled.div`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  font-weight: ${props => props.active ? '600' : '400'};
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
    border-radius: 3px 3px 0 0;
  }
  
  &:hover {
    color: var(--primary-color);
  }
`;

const StatisticsCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px var(--shadow-color);
  margin-bottom: 1.5rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
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
  color: var(--text-primary);
`;

const StatSelectContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const StatSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
`;

const StatChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: var(--card-bg);
`;

const TableHeader = styled.thead`
  background-color: ${props => props.theme === 'dark' ? '#3a3a3a' : '#f8f9fa'};
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  font-size: 0.9rem;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
`;

const ScoreCell = styled(TableCell)`
  font-weight: 600;
  color: ${props => {
    if (props.score >= 8) return '#10b981'; // Green for excellent
    if (props.score >= 6.5) return '#f59e0b'; // Yellow for good
    if (props.score >= 5) return '#ef4444'; // Red for average
    return '#6b7280'; // Gray for poor
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyStateText = styled.div`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const EmptyStateSubtext = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
`;

const COLORS = ['#6a00ff', '#ff2e8e', '#00c16e', '#f5a623'];

function ReportPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('examScores');
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [examScoreStats, setExamScoreStats] = useState(null);
  const [studentScores, setStudentScores] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading report data with user:', user);
        let classesResponse;
        
        // Kiểm tra role người dùng
        if (!user || !user.id) {
          throw new Error('User information not available');
        }
        
        const userRole = user.role?.toUpperCase();
        console.log('User role for report page:', userRole);
        
        // Thực hiện gọi API dựa vào vai trò
        if (userRole === 'ROLE_ADMIN') {
          // Nếu là admin, lấy tất cả các lớp
          console.log('User is admin, getting all classes');
          classesResponse = await classService.getAllClasses(0, 50);
        } else if (userRole === 'ROLE_LECTURER') {
          // Nếu là giảng viên, chỉ lấy các lớp họ dạy
          console.log('User is lecturer, getting classes by teacher ID:', user.id);
          classesResponse = await classService.getClassesByTeacher(user.id, 0, 50);
        } else {
          throw new Error('Unauthorized access or invalid role');
        }
        
        console.log('Classes response:', classesResponse);
        
        // Xử lý dữ liệu classes, đảm bảo dữ liệu đúng định dạng
        let classesData = [];
        if (classesResponse && classesResponse.data) {
          if (classesResponse.data.content) {
            // Nếu là dữ liệu phân trang
            classesData = classesResponse.data.content.map(cls => ({
              id: cls.id,
              name: cls.name || `Class #${cls.id}`
            }));
          } else if (Array.isArray(classesResponse.data)) {
            // Nếu là mảng
            classesData = classesResponse.data.map(cls => ({
              id: cls.id,
              name: cls.name || `Class #${cls.id}`
            }));
          }
        }
        setClasses(classesData);
        
        // Nếu có lớp học, lấy bài thi từ lớp đầu tiên
        if (classesData.length > 0) {
          setSelectedClassId(classesData[0].id);
          
          // Lấy danh sách bài thi từ lớp đầu tiên
          const examsResponse = await examService.getExamsByClass(classesData[0].id, 0, 50);
          console.log('Exams response:', examsResponse);
          
          // Xử lý dữ liệu exams
          let examsData = [];
          if (examsResponse && examsResponse.data) {
            if (examsResponse.data.content) {
              // Nếu là dữ liệu phân trang
              examsData = examsResponse.data.content.map(exam => ({
                id: exam.id,
                name: exam.title || `Exam #${exam.id}`,
                classId: exam.classId
              }));
            } else if (Array.isArray(examsResponse.data)) {
              // Nếu là mảng
              examsData = examsResponse.data.map(exam => ({
                id: exam.id,
                name: exam.title || `Exam #${exam.id}`,
                classId: exam.classId
              }));
            }
          }
          setExams(examsData);
          
          // Nếu có bài thi, lấy thống kê từ bài thi đầu tiên
          if (examsData.length > 0) {
            setSelectedExamId(examsData[0].id);
            loadExamStats(examsData[0].id);
          } else {
            // Không có bài thi nào, đặt giá trị mặc định
            setSelectedExamId(null);
            setExamScoreStats({
              minScore: 0,
              maxScore: 0,
              avgScore: 0
            });
          }
          
          // Lấy danh sách điểm sinh viên trong lớp
          loadExamsInClass(classesData[0].id);
        } else {
          // Không có lớp học nào
          setError('No classes found. Please check your account permissions.');
        }
      } catch (error) {
        console.error('Error loading report data:', error);
        setError('Failed to load report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadReportData();
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

  // Tải thông tin bài thi trong lớp học được chọn
  const loadExamsInClass = async (classId) => {
    if (!classId) return;
    
    try {
      setLoading(true);
      
      // Lấy danh sách bài thi từ API
      const examsResponse = await examService.getExamsByClass(classId, 0, 50);
      console.log(`Exams for class ${classId}:`, examsResponse);
      
      // Xử lý dữ liệu exams
      let examsData = [];
      if (examsResponse && examsResponse.data) {
        if (examsResponse.data.content) {
          // Nếu là dữ liệu phân trang
          examsData = examsResponse.data.content.map(exam => ({
            id: exam.id,
            name: exam.title || `Exam #${exam.id}`,
            classId: exam.classId
          }));
        } else if (Array.isArray(examsResponse.data)) {
          // Nếu là mảng
          examsData = examsResponse.data.map(exam => ({
            id: exam.id,
            name: exam.title || `Exam #${exam.id}`,
            classId: exam.classId
          }));
        }
      }
      setExams(examsData);
      
      // Nếu có bài thi, chọn bài thi đầu tiên và tải thống kê
      if (examsData.length > 0) {
        setSelectedExamId(examsData[0].id);
        loadExamStats(examsData[0].id);
      } else {
        setSelectedExamId(null);
        setExamScoreStats(null);
      }
      
      // Tải danh sách điểm của sinh viên trong lớp từ API
      try {
        // Sử dụng API thống kê điểm sinh viên
        const studentScoresResponse = await dashboardService.getStudentScoresInClass(classId);
        console.log('Student scores API response:', studentScoresResponse);
        console.log('Student scores content:', studentScoresResponse?.content);
        
        if (studentScoresResponse && studentScoresResponse.content) {
          // Log raw data for debugging
          console.log('Raw student scores from API:', studentScoresResponse.content);
          
          // Lấy dữ liệu từ API và định dạng để hiển thị trong biểu đồ
          const studentScoresData = studentScoresResponse.content.map((score, index) => {
            console.log(`Processing student ${index}:`, score);
            
            // Handle different possible field names from API
            const avgScore = score.averageScore ?? score.avgScore ?? 0;
            const avgScoreIn10 = score.averageScoreIn10 ?? score.avgScoreIn10 ?? avgScore;
            const avgScoreIn4 = score.averageScoreIn4 ?? score.avgScoreIn4 ?? (avgScore * 0.4);
            
            const processedStudent = {
              studentId: score.studentId,
              studentName: score.studentName || `Student #${score.studentId}`,
              avgScore: avgScore,
              avgScoreIn10: avgScoreIn10,
              avgScoreIn4: avgScoreIn4
            };
            
            console.log(`Processed student ${index}:`, processedStudent);
            return processedStudent;
          });
          
          console.log('Processed student scores data:', studentScoresData);
          setStudentScores(studentScoresData);
        } else {
          console.log('No student scores content found');
          setStudentScores([]);
        }
      } catch (studentsError) {
        console.error('Error loading student scores:', studentsError);
        setStudentScores([]);
      }
    } catch (error) {
      console.error('Error loading exams in class:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Tải thống kê điểm số của bài thi được chọn
  const loadExamStats = async (examId) => {
    if (!examId) return;
    
    try {
      setLoading(true);
      
      // Sử dụng API thống kê điểm bài thi
      try {
        // Gọi API thống kê điểm bài thi
        const examStatsResponse = await dashboardService.getExamScoreStatistics(examId);
        console.log('Exam stats API response:', examStatsResponse);
        
        if (examStatsResponse) {
          // Cập nhật state với dữ liệu từ API
          setExamScoreStats({
            minScore: examStatsResponse.minScore || 0,
            maxScore: examStatsResponse.maxScore || 0,
            avgScore: examStatsResponse.avgScore || 0
          });
        } else {
          // Fallback nếu API không trả về dữ liệu hợp lệ
          setExamScoreStats({
            minScore: 0,
            maxScore: 0,
            avgScore: 0
          });
        }
      } catch (examError) {
        console.error('Error loading exam statistics:', examError);
        
        // Dữ liệu mẫu nếu API lỗi
        setExamScoreStats({
          minScore: 0,
          maxScore: 0,
          avgScore: 0
        });
      }
    } catch (error) {
      console.error('Error loading exam statistics:', error);
    } finally {
      setLoading(false);
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
    setShowLogoutConfirmation(true);
  };
  
  const handleConfirmLogout = () => {
    console.log('ReportPage: Executing logout after confirmation');
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
      
      {loading ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Loading statistics...
        </div>
      ) : error ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
          {error}
        </div>
      ) : (
        <>
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
        </>
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
      
      {loading ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div>Loading statistics...</div>
          </div>
        </div>
      ) : error ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <div>{error}</div>
          </div>
        </div>
      ) : studentScores.length > 0 ? (
        <>
          <TableContainer>
            <Table>
              <TableHeader theme={theme}>
                <tr>
                  <TableHeaderCell>#</TableHeaderCell>
                  <TableHeaderCell>Student Name</TableHeaderCell>
                  <TableHeaderCell>Student ID</TableHeaderCell>
                  <TableHeaderCell>Average Score</TableHeaderCell>
                  <TableHeaderCell>Score (Scale 10)</TableHeaderCell>
                  <TableHeaderCell>Score (Scale 4)</TableHeaderCell>
                  <TableHeaderCell>Grade</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {studentScores.map((student, index) => {
                  // Use the already processed values directly
                  const avgScore = student.avgScore;
                  const scoreIn10 = student.avgScoreIn10;
                  const scoreIn4 = student.avgScoreIn4;
                  
                  // Grade mapping based on 4-point scale (Vietnamese system)
                  const getGradeInfo = (score4) => {
                    if (score4 >= 3.5) return { grade: 'A', color: '#10b981' }; // 3.5-4.0
                    if (score4 >= 3.0) return { grade: 'B+', color: '#059669' }; // 3.0-3.4
                    if (score4 >= 2.5) return { grade: 'B', color: '#f59e0b' }; // 2.5-2.9
                    if (score4 >= 2.0) return { grade: 'C+', color: '#d97706' }; // 2.0-2.4
                    if (score4 >= 1.5) return { grade: 'C', color: '#ef4444' }; // 1.5-1.9
                    if (score4 >= 1.0) return { grade: 'D+', color: '#dc2626' }; // 1.0-1.4
                    if (score4 >= 0.5) return { grade: 'D', color: '#991b1b' }; // 0.5-0.9
                    return { grade: 'F', color: '#6b7280' }; // 0-0.4
                  };
                  
                  const gradeInfo = getGradeInfo(scoreIn4);
                  
                  return (
                    <TableRow key={student.studentId} theme={theme}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <ScoreCell score={avgScore}>{avgScore.toFixed(2)}</ScoreCell>
                      <ScoreCell score={scoreIn10}>{scoreIn10.toFixed(2)}</ScoreCell>
                      <ScoreCell score={scoreIn4}>{scoreIn4.toFixed(2)}</ScoreCell>
                      <TableCell>
                        <span style={{ 
                          color: gradeInfo.color, 
                          fontWeight: '700',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: `${gradeInfo.color}20`,
                          fontSize: '0.9rem',
                          fontFamily: 'monospace'
                        }}>
                          {gradeInfo.grade}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem',
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing {studentScores.length} students in selected class
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
                <span>A (3.5-4.0)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#059669', borderRadius: '2px' }}></div>
                <span>B+ (3.0-3.4)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
                <span>B (2.5-2.9)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#d97706', borderRadius: '2px' }}></div>
                <span>C+ (2.0-2.4)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
                <span>C (1.5-1.9)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#dc2626', borderRadius: '2px' }}></div>
                <span>D+ (1.0-1.4)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#991b1b', borderRadius: '2px' }}></div>
                <span>D (0.5-0.9)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#6b7280', borderRadius: '2px' }}></div>
                <span>F (0-0.4)</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <EmptyState>
          <EmptyStateIcon>📊</EmptyStateIcon>
          <EmptyStateText>No Student Data Available</EmptyStateText>
          <EmptyStateSubtext>
            {selectedClassId ? 
              'No students found in this class or no exam results available.' : 
              'Please select a class to view student statistics.'
            }
          </EmptyStateSubtext>
        </EmptyState>
      )}
    </StatisticsCard>
  );

  return (
    <>
      <ThemeStyles />
      <ReportContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        <Sidebar theme={theme}>
          <Logo>logo</Logo>
          <SidebarMenu>
            {/* Conditional rendering based on user role */}
            {user && user.role?.toUpperCase() === 'ROLE_ADMIN' ? (
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
                <NavItem to="/class">
                  <NavIcon>{getMenuIcon('class')}</NavIcon>
                  Class
                </NavItem>
                <NavItem to="/reports" className="active">
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
              <h1>Reports & Analytics</h1>
              <p>View detailed statistics and reports</p>
            </PageTitle>
            
            <HeaderRight>
              <ThemeToggle />
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
        
        {/* Thêm modal xác nhận đăng xuất */}
        <ConfirmationModal
          isOpen={showLogoutConfirmation}
          onClose={() => setShowLogoutConfirmation(false)}
          onConfirm={handleConfirmLogout}
          message="Are you sure you want to logout?"
        />
      </ReportContainer>
    </>
  );
}

export default ReportPage; 