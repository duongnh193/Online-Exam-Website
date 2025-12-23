import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import classService from '../services/classService';
import examService from '../services/examService';
import questionService from '../services/questionService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  DashboardContainer as ReportContainer,
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
} from '../components/dashboard/DashboardStyles';
import { SPACING_SCALE, TYPOGRAPHY_SCALE, RADIUS_SCALE } from '../theme/tokens';
import { SEMANTIC } from '../theme/colors';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';

const PageIntro = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING_SCALE.xs};
`;

const PageTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING_SCALE.sm};
`;

const TitleIcon = styled.span`
  width: 40px;
  height: 40px;
  border-radius: ${RADIUS_SCALE.round};
  background: rgba(106, 0, 255, 0.12);
  color: #6a00ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
`;

const Breadcrumbs = styled.nav`
  display: flex;
  align-items: center;
  gap: ${SPACING_SCALE.xs};
  font-size: ${TYPOGRAPHY_SCALE.sm};
  color: var(--text-secondary);
  
  span {
    color: inherit;
  }
`;

const TabContainer = styled.div`
  display: inline-flex;
  gap: ${SPACING_SCALE.sm};
  padding: ${SPACING_SCALE.xs};
  border-radius: 999px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  margin-bottom: ${SPACING_SCALE.lg};
  align-self: flex-start;
`;

const Tab = styled.button`
  padding: ${SPACING_SCALE.xs} ${SPACING_SCALE.lg};
  font-size: ${TYPOGRAPHY_SCALE.sm};
  cursor: pointer;
  border: none;
  border-radius: 999px;
  position: relative;
  color: ${({ $active }) => ($active ? 'var(--highlight-color)' : 'var(--text-secondary)')};
  font-weight: 600;
  background: ${({ $active }) => ($active ? 'rgba(106, 0, 255, 0.12)' : 'transparent')};
  transition: background 0.2s ease, color 0.2s ease;
  
  &:hover {
    color: var(--highlight-color);
    background: rgba(106, 0, 255, 0.08);
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 20%;
    right: 20%;
    bottom: -6px;
    height: 4px;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? 'var(--highlight-color)' : 'transparent')};
  }
`;

const StatisticsCard = styled.section`
  background-color: var(--card-bg);
  border-radius: var(--radius-lg, ${RADIUS_SCALE.lg});
  padding: ${SPACING_SCALE.lg};
  box-shadow: var(--card-shadow);
  margin-bottom: ${SPACING_SCALE.lg};
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING_SCALE.md};
  gap: ${SPACING_SCALE.md};
  flex-wrap: wrap;
`;

const StatTitle = styled.h3`
  margin: 0;
  font-size: ${TYPOGRAPHY_SCALE.md};
  color: var(--text-primary);
`;

const StatSubtitle = styled.p`
  margin: 0;
  font-size: ${TYPOGRAPHY_SCALE.sm};
  color: var(--text-secondary);
`;

const StatTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING_SCALE.sm};
  flex-wrap: wrap;
`;

const StatSelect = styled.select`
  padding: ${SPACING_SCALE.xs} ${SPACING_SCALE.sm};
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm, ${RADIUS_SCALE.sm});
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: ${TYPOGRAPHY_SCALE.sm};
`;

const InlineSelect = styled(StatSelect)`
  min-width: 200px;
`;

const StatChartContainer = styled.div`
  height: 320px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
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
  border-spacing: 0;
`;

const TableHeader = styled.thead`
  background-color: ${props => props.theme === 'dark' ? '#3a3a3a' : '#f8f9fa'};
`;

const TableHeaderCell = styled.th`
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  font-size: 0.9rem;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  min-height: 64px;
  transition: background 0.2s ease;

  &:nth-child(even) {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f9fafb'};
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f2f0ff'};
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.25rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
`;

const NumericHeaderCell = styled(TableHeaderCell)`
  text-align: center;
`;

const NumericCell = styled(TableCell)`
  text-align: center;
  font-variant-numeric: tabular-nums;
`;

const ScoreCell = styled(TableCell)`
  font-weight: 600;
  text-align: center;
  font-variant-numeric: tabular-nums;
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

const SCORE_COLORS = ['#6A00FF', '#836FFF', '#36C988', '#FFB74D', '#FF5C8D', '#2BB7DA'];

const TooltipCard = styled.div`
  background: var(--bg-secondary);
  padding: ${SPACING_SCALE.xs} ${SPACING_SCALE.sm};
  border-radius: ${RADIUS_SCALE.sm};
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
`;

const TooltipLabel = styled.div`
  font-size: ${TYPOGRAPHY_SCALE.sm};
  color: var(--text-secondary);
`;

const TooltipValue = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: ${TYPOGRAPHY_SCALE.base};
`;

const LegendCard = styled.div`
  margin-top: ${SPACING_SCALE.md};
  padding: ${SPACING_SCALE.md};
  background: var(--bg-secondary);
  border-radius: var(--radius-lg, ${RADIUS_SCALE.lg});
  display: flex;
  flex-direction: column;
  gap: ${SPACING_SCALE.sm};
`;

const LegendHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${SPACING_SCALE.sm};
`;

const LegendContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING_SCALE.md};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING_SCALE.xs};
  font-size: ${TYPOGRAPHY_SCALE.sm};
  color: var(--text-secondary);
`;

const LegendSwatch = styled.span`
  width: 16px;
  height: 16px;
  border-radius: ${RADIUS_SCALE.sm};
  background-color: ${({ $color }) => $color};
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const StatSummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${SPACING_SCALE.lg};
  margin-top: ${SPACING_SCALE.md};
  flex-wrap: wrap;
`;

const StatSummaryItem = styled.div`
  flex: 1;
  min-width: 160px;
  text-align: center;
`;

const StatSummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ $color }) => $color || 'var(--highlight-color)'};
`;

const StatSummaryLabel = styled.div`
  font-size: ${TYPOGRAPHY_SCALE.sm};
  color: var(--text-secondary);
`;

const ChartState = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: ${SPACING_SCALE.xs};
  color: ${({ $error }) => ($error ? SEMANTIC?.error?.main || '#D14343' : 'inherit')};
`;

const StateIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${SPACING_SCALE.xs};
`;

const CenteredMessage = styled.div`
  text-align: center;
  padding: ${SPACING_SCALE.lg};
  color: ${({ $muted }) => ($muted ? 'var(--text-secondary)' : 'inherit')};
`;

const QuestionStatHeading = styled(StatTitle)`
  margin-bottom: ${SPACING_SCALE.xs};
`;

const GradePill = styled.span`
  color: ${({ $color }) => $color};
  font-weight: 700;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background-color: ${({ $color }) => `${$color}22`};
  font-size: 0.9rem;
  font-family: monospace;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
`;

const GRADE_SCALE = [
  { label: 'A (3.5-4.0)', color: '#10b981' },
  { label: 'B+ (3.0-3.4)', color: '#059669' },
  { label: 'B (2.5-2.9)', color: '#f59e0b' },
  { label: 'C+ (2.0-2.4)', color: '#d97706' },
  { label: 'C (1.5-1.9)', color: '#ef4444' },
  { label: 'D+ (1.0-1.4)', color: '#dc2626' },
  { label: 'D (0.5-0.9)', color: '#991b1b' },
  { label: 'F (0-0.4)', color: '#6b7280' },
];

// Add new styled components for question statistics
const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING_SCALE.xs};
  margin-top: ${SPACING_SCALE.sm};
  max-height: 500px;
  overflow-y: auto;
  padding-right: ${SPACING_SCALE.xs};
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: ${RADIUS_SCALE.round};
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: ${RADIUS_SCALE.round};
    
    &:hover {
      background: var(--text-secondary);
    }
  }
`;

const QuestionCard = styled.div`
  background-color: var(--card-bg);
  border-radius: var(--radius-md, ${RADIUS_SCALE.md});
  padding: ${SPACING_SCALE.sm} ${SPACING_SCALE.md};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${({ selected }) => (selected ? 'var(--highlight-color)' : 'var(--border-color)')};
  box-shadow: ${({ selected }) => (selected ? '0 2px 8px rgba(106, 0, 255, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.05)')};
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: var(--highlight-color);
    box-shadow: 0 2px 8px rgba(106, 0, 255, 0.1);
    transform: translateX(2px);
  }
  
  ${({ selected }) => selected && `
    background: linear-gradient(90deg, rgba(106, 0, 255, 0.05) 0%, var(--card-bg) 3%);
  `}
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING_SCALE.sm};
`;

const QuestionNumber = styled.div`
  flex-shrink: 0;
  font-size: ${TYPOGRAPHY_SCALE.sm};
  font-weight: 600;
  color: ${({ selected }) => (selected ? 'var(--highlight-color)' : 'var(--text-secondary)')};
  min-width: 50px;
`;

const QuestionTitle = styled.div`
  flex: 1;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  font-size: ${TYPOGRAPHY_SCALE.sm};
  
  /* Single line truncation */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0; /* Important for flex truncation */
`;

const QuestionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING_SCALE.sm};
  margin-top: ${SPACING_SCALE.xs};
  padding-top: ${SPACING_SCALE.xs};
  border-top: 1px solid var(--border-color);
  font-size: ${TYPOGRAPHY_SCALE.xs};
  color: var(--text-secondary);
`;

const QuestionTypeBadge = styled.span`
  padding: 2px 6px;
  border-radius: ${RADIUS_SCALE.sm};
  font-size: ${TYPOGRAPHY_SCALE.xs};
  font-weight: 600;
  background-color: ${({ type }) => {
    if (type === 'SINGLE_CHOICE') return 'rgba(106, 0, 255, 0.1)';
    if (type === 'MULTIPLE_CHOICE') return 'rgba(54, 201, 136, 0.1)';
    return 'rgba(255, 184, 77, 0.1)';
  }};
  color: ${({ type }) => {
    if (type === 'SINGLE_CHOICE') return '#6a00ff';
    if (type === 'MULTIPLE_CHOICE') return '#36c988';
    return '#ffb84d';
  }};
`;

const AnswerStatsContainer = styled.div`
  margin-top: ${SPACING_SCALE.md};
  padding: ${SPACING_SCALE.lg};
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg, ${RADIUS_SCALE.lg});
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: ${SPACING_SCALE.md};
`;

const AnswerStatsContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING_SCALE.lg};
  align-items: center;
`;

const DonutWrapper = styled.div`
  flex: 0 0 320px;
  height: 260px;
  min-width: 260px;
  width: 100%;
`;

const AnswerList = styled.div`
  flex: 1;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: ${SPACING_SCALE.sm};
`;

const AnswerItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${SPACING_SCALE.sm};
  padding: ${SPACING_SCALE.sm};
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, ${RADIUS_SCALE.md});
  background-color: var(--card-bg);
`;

const AnswerLegendSwatch = styled.span`
  width: 14px;
  height: 14px;
  border-radius: ${RADIUS_SCALE.round};
  background-color: ${({ $color }) => $color};
  margin-top: 2px;
`;

const AnswerItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const AnswerItemMeta = styled.span`
  font-size: ${TYPOGRAPHY_SCALE.sm};
  color: var(--text-secondary);
`;

const TotalsRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: ${SPACING_SCALE.md};
`;

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
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionStats, setQuestionStats] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        let classesResponse;
        
        // Kiểm tra role người dùng
        if (!user || !user.id) {
          throw new Error('User information not available');
        }
        
        const userRole = user.role?.toUpperCase();
        
        // Thực hiện gọi API dựa vào vai trò
        if (userRole === 'ROLE_ADMIN') {
          // Nếu là admin, lấy tất cả các lớp
          classesResponse = await classService.getAllClasses(0, 50);
        } else if (userRole === 'ROLE_LECTURER') {
          // Nếu là giảng viên, chỉ lấy các lớp họ dạy
          classesResponse = await classService.getClassesByTeacher(user.id, 0, 50);
        } else {
          throw new Error('Unauthorized access or invalid role');
        }
        
        
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

  // Sửa lại hàm loadExamsInClass
  const loadExamsInClass = async (classId) => {
    if (!classId) return;
    
    try {
      setLoading(true);
      
      // Lấy danh sách bài thi từ API
      const examsResponse = await examService.getExamsByClass(classId, 0, 50);
      
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
        const firstExamId = examsData[0].id;
        setSelectedExamId(firstExamId);
        loadExamStats(firstExamId);
        
        // Chỉ load questions mà không tự động chọn câu hỏi đầu tiên
        loadQuestions(firstExamId).then(() => {
          // Reset selected question và stats khi load questions mới
          setSelectedQuestion(null);
          setQuestionStats(null);
        });
      } else {
        setSelectedExamId(null);
        setExamScoreStats(null);
        setQuestions([]);
        setSelectedQuestion(null);
        setQuestionStats(null);
      }
      
      // Tải danh sách điểm của sinh viên trong lớp từ API
      try {
        // Sử dụng API thống kê điểm sinh viên
        const studentScoresResponse = await dashboardService.getStudentScoresInClass(classId);
        
        if (studentScoresResponse && studentScoresResponse.content) {
          // Log raw data for debugging
          
          // Lấy dữ liệu từ API và định dạng để hiển thị trong biểu đồ
          const studentScoresData = studentScoresResponse.content.map((score, index) => {
            
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
            
            return processedStudent;
          });
          
          setStudentScores(studentScoresData);
        } else {
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
  
  // Sửa lại hàm handleClassChange để không reset activeTab
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
    loadQuestions(examId);
    setSelectedQuestion(null);
    setQuestionStats(null);
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

  const MENU_ICONS = {
    dashboard: <SpaceDashboardOutlinedIcon fontSize="small" />,
    exams: <QuizOutlinedIcon fontSize="small" />,
    class: <ClassOutlinedIcon fontSize="small" />,
    reports: <AssessmentOutlinedIcon fontSize="small" />,
    assistant: <SmartToyOutlinedIcon fontSize="small" />,
    settings: <SettingsOutlinedIcon fontSize="small" />,
    signout: <LogoutOutlinedIcon fontSize="small" />,
  };

  const getMenuIcon = (name) => MENU_ICONS[name] || <CircleOutlinedIcon fontSize="small" />;

  // Add new function to load questions when exam changes
  const loadQuestions = async (examId) => {
    if (!examId) return;
    
    try {
      setLoadingQuestions(true);
      const response = await questionService.getAllQuestionsInExam(examId);
      
      if (response.data && response.data.content) {
        setQuestions(response.data.content);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Add new function to load question statistics
  const loadQuestionStats = async (questionId) => {
    if (!questionId) return;
    
    try {
      setLoadingStats(true);
      const response = await questionService.getQuestionStatistics(questionId);
      setQuestionStats(response.data);
    } catch (error) {
      console.error('Error loading question statistics:', error);
      setQuestionStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  // Add new function to handle question selection
  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    loadQuestionStats(question.id);
  };

  const renderScoreTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <TooltipCard>
        <TooltipLabel>{label}</TooltipLabel>
        <TooltipValue>{payload[0].value.toFixed(2)} score</TooltipValue>
      </TooltipCard>
    );
  };

  const renderAnswerTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0];
    return (
      <TooltipCard>
        <TooltipLabel>{entry.name}</TooltipLabel>
        <TooltipValue>{entry.value} students</TooltipValue>
      </TooltipCard>
    );
  };

  // Render exam statistics
  const renderExamStatistics = () => {
    const distributionData = getScoreDistributionData().map(item => ({
      ...item,
      value: Math.min(Math.max(item.value, 1), 10)
    }));
    
    return (
      <StatisticsCard>
        <StatHeader>
          <div>
            <StatTitleGroup>
              <StatTitle>Exam Score Statistics</StatTitle>
              <InlineSelect value={selectedExamId || ''} onChange={handleExamChange} aria-label="Select exam">
                <option value="">Select Exam</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </InlineSelect>
            </StatTitleGroup>
            <StatSubtitle>Track how each exam performs across your class.</StatSubtitle>
          </div>
        </StatHeader>
        
        {loading ? (
          <ChartState>Loading statistics...</ChartState>
        ) : error ? (
          <ChartState $error>{error}</ChartState>
        ) : (
          <>
            <StatChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 16, right: 16, left: 0, bottom: 24 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 6" stroke="rgba(99, 102, 241, 0.15)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  />
                  <YAxis 
                    domain={[1, 10]}
                    ticks={[2, 4, 6, 8, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 12 }}
                  />
                  <Tooltip content={renderScoreTooltip} cursor={{ fill: 'rgba(106, 0, 255, 0.08)' }} />
                  <Bar dataKey="value">
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </StatChartContainer>
            
            {examScoreStats && (
              <StatSummaryRow>
                <StatSummaryItem>
                  <StatSummaryValue $color={SCORE_COLORS[0]}>
                    {examScoreStats.minScore.toFixed(1)}
                  </StatSummaryValue>
                  <StatSummaryLabel>Min Score</StatSummaryLabel>
                </StatSummaryItem>
                <StatSummaryItem>
                  <StatSummaryValue $color={SCORE_COLORS[2]}>
                    {examScoreStats.avgScore.toFixed(1)}
                  </StatSummaryValue>
                  <StatSummaryLabel>Average Score</StatSummaryLabel>
                </StatSummaryItem>
                <StatSummaryItem>
                  <StatSummaryValue $color={SCORE_COLORS[4]}>
                    {examScoreStats.maxScore.toFixed(1)}
                  </StatSummaryValue>
                  <StatSummaryLabel>Max Score</StatSummaryLabel>
                </StatSummaryItem>
              </StatSummaryRow>
            )}
          </>
        )}
      </StatisticsCard>
    );
  };

  // Render student statistics
  const renderStudentScoreStatistics = () => (
    <StatisticsCard>
      <StatHeader>
        <div>
          <StatTitleGroup>
            <StatTitle>Student Score Statistics</StatTitle>
            <InlineSelect value={selectedClassId || ''} onChange={handleClassChange} aria-label="Select class">
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </InlineSelect>
          </StatTitleGroup>
          <StatSubtitle>Review every student’s performance within the selected class.</StatSubtitle>
        </div>
      </StatHeader>
      
      {loading ? (
        <ChartState>
          <StateIcon>⏳</StateIcon>
          <div>Loading statistics...</div>
        </ChartState>
      ) : error ? (
        <ChartState $error>
          <StateIcon>❌</StateIcon>
          <div>{error}</div>
        </ChartState>
      ) : studentScores.length > 0 ? (
        <>
          <TableContainer>
            <Table>
              <TableHeader theme={theme}>
                <tr>
                  <NumericHeaderCell>#</NumericHeaderCell>
                  <TableHeaderCell>Student Name</TableHeaderCell>
                  <NumericHeaderCell>Student ID</NumericHeaderCell>
                  <NumericHeaderCell>Average Score</NumericHeaderCell>
                  <NumericHeaderCell>Score (Scale 10)</NumericHeaderCell>
                  <NumericHeaderCell>Score (Scale 4)</NumericHeaderCell>
                  <NumericHeaderCell>Grade</NumericHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {studentScores.map((student, index) => {
                  const avgScore = student.avgScore;
                  const scoreIn10 = student.avgScoreIn10;
                  const scoreIn4 = student.avgScoreIn4;
                  
                  const getGradeInfo = (score4) => {
                    if (score4 >= 3.5) return { grade: 'A', color: '#10b981' };
                    if (score4 >= 3.0) return { grade: 'B+', color: '#059669' };
                    if (score4 >= 2.5) return { grade: 'B', color: '#f59e0b' };
                    if (score4 >= 2.0) return { grade: 'C+', color: '#d97706' };
                    if (score4 >= 1.5) return { grade: 'C', color: '#ef4444' };
                    if (score4 >= 1.0) return { grade: 'D+', color: '#dc2626' };
                    if (score4 >= 0.5) return { grade: 'D', color: '#991b1b' };
                    return { grade: 'F', color: '#6b7280' };
                  };
                  
                  const gradeInfo = getGradeInfo(scoreIn4);
                  
                  return (
                    <TableRow key={student.studentId} theme={theme}>
                      <NumericCell>{index + 1}</NumericCell>
                      <TableCell>{student.studentName}</TableCell>
                      <NumericCell>{student.studentId}</NumericCell>
                      <ScoreCell score={avgScore}>{avgScore.toFixed(2)}</ScoreCell>
                      <ScoreCell score={scoreIn10}>{scoreIn10.toFixed(2)}</ScoreCell>
                      <ScoreCell score={scoreIn4}>{scoreIn4.toFixed(2)}</ScoreCell>
                      <NumericCell>
                        <GradePill $color={gradeInfo.color}>{gradeInfo.grade}</GradePill>
                      </NumericCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <LegendCard>
            <LegendHeader>
              <StatSubtitle>Showing {studentScores.length} students</StatSubtitle>
              <StatSubtitle>Grade scale overview</StatSubtitle>
            </LegendHeader>
            <LegendContent>
              {GRADE_SCALE.map(scale => (
                <LegendItem key={scale.label}>
                  <LegendSwatch $color={scale.color} />
                  <span>{scale.label}</span>
                </LegendItem>
              ))}
            </LegendContent>
          </LegendCard>
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

  // Add new render function for question statistics
  const renderQuestionStatistics = () => (
    <StatisticsCard>
      <StatHeader>
        <div>
          <StatTitleGroup>
            <StatTitle>Question Answer Statistics</StatTitle>
            <InlineSelect value={selectedExamId || ''} onChange={handleExamChange} aria-label="Select exam for questions">
              <option value="">Select Exam</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </InlineSelect>
          </StatTitleGroup>
          <StatSubtitle>Pinpoint tricky questions and see how students responded.</StatSubtitle>
        </div>
      </StatHeader>

      {loadingQuestions ? (
        <CenteredMessage>Loading questions...</CenteredMessage>
      ) : questions.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>❓</EmptyStateIcon>
          <EmptyStateText>No Questions Available</EmptyStateText>
          <EmptyStateSubtext>
            {selectedExamId ? 
              'No questions found in this exam.' : 
              'Please select an exam to view questions.'
            }
          </EmptyStateSubtext>
        </EmptyState>
      ) : (
        <>
          <QuestionList>
            {questions.map((question, index) => {
              const questionNumber = index + 1;
              
              return (
                <QuestionCard 
                  key={question.id}
                  selected={selectedQuestion?.id === question.id}
                  onClick={() => handleQuestionSelect(question)}
                >
                  <QuestionHeader>
                    <QuestionNumber selected={selectedQuestion?.id === question.id}>
                      Q{questionNumber}
                    </QuestionNumber>
                    <QuestionTitle title={question.title}>
                      {question.title}
                    </QuestionTitle>
                  </QuestionHeader>
                  <QuestionMeta>
                    <QuestionTypeBadge type={question.type}>
                      {question.type === 'SINGLE_CHOICE' ? 'Single Choice' : 
                       question.type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 
                       'Essay'}
                    </QuestionTypeBadge>
                    {question.choices && question.choices.length > 0 && (
                      <span>{question.choices.length} options</span>
                    )}
                  </QuestionMeta>
                </QuestionCard>
              );
            })}
          </QuestionList>

          {selectedQuestion && (
            <AnswerStatsContainer>
              <div>
                <QuestionStatHeading>
                  Statistics for Question {questions.findIndex(q => q.id === selectedQuestion.id) + 1}
                </QuestionStatHeading>
                <StatSubtitle>Response distribution per answer choice</StatSubtitle>
              </div>
              
              {loadingStats ? (
                <CenteredMessage>Loading statistics...</CenteredMessage>
              ) : questionStats ? (
                (() => {
                  let statsArray = [];
                  
                  if (questionStats.answerStats && typeof questionStats.answerStats === 'object') {
                    if (Array.isArray(questionStats.answerStats)) {
                      statsArray = questionStats.answerStats;
                    } else {
                      statsArray = Object.entries(questionStats.answerStats).map(([answer, count]) => ({
                        answer,
                        count
                      }));
                    }
                  }
                  
                  const totalStudents = questionStats.totalStudents || statsArray.reduce((sum, stat) => sum + (stat.count || 0), 0);
                  
                  if (statsArray.length === 0) {
                    return (
                      <CenteredMessage $muted>
                        No answer statistics available for this question
                      </CenteredMessage>
                    );
                  }
                  
                  const donutData = statsArray.map((stat, index) => ({
                    name: stat.answer || `Option ${index + 1}`,
                    value: stat.count || 0,
                    fill: SCORE_COLORS[index % SCORE_COLORS.length]
                  }));
                  
                  return (
                    <>
                      <AnswerStatsContent>
                        <DonutWrapper>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={donutData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius="65%"
                                outerRadius="85%"
                                paddingAngle={2}
                                stroke="none"
                              >
                                {donutData.map((entry, index) => (
                                  <Cell key={`slice-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip content={renderAnswerTooltip} />
                            </PieChart>
                          </ResponsiveContainer>
                        </DonutWrapper>
                        <AnswerList>
                          {statsArray.map((stat, index) => {
                            const count = stat.count || 0;
                            const percent = totalStudents ? Math.round((count / totalStudents) * 100) : 0;
                            const color = SCORE_COLORS[index % SCORE_COLORS.length];
                            return (
                              <AnswerItem key={index}>
                                <AnswerLegendSwatch $color={color} />
                                <AnswerItemBody>
                                  <strong>{stat.answer || `Option ${index + 1}`}</strong>
                                  <AnswerItemMeta>{percent}% · {count} students</AnswerItemMeta>
                                </AnswerItemBody>
                              </AnswerItem>
                            );
                          })}
                        </AnswerList>
                      </AnswerStatsContent>
                      <TotalsRow>
                        <span>Total Students</span>
                        <span>{totalStudents}</span>
                      </TotalsRow>
                    </>
                  );
                })()
              ) : (
                <CenteredMessage $muted>No statistics available for this question</CenteredMessage>
              )}
            </AnswerStatsContainer>
          )}
        </>
      )}
    </StatisticsCard>
  );

  return (
    <ReportContainer>
      <Sidebar>
        <Logo>
          <span>RP</span>
          Reports
        </Logo>
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
                <NavItem to="/ai-assistant">
                  <NavIcon>{getMenuIcon('assistant')}</NavIcon>
                  AI Assistant
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
                <NavItem to="/ai-assistant">
                  <NavIcon>{getMenuIcon('assistant')}</NavIcon>
                  AI Assistant
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
            <PageIntro>
              <Breadcrumbs aria-label="Breadcrumb">
                <span>Dashboard</span>
                <span>›</span>
                <span>Reports</span>
              </Breadcrumbs>
              <PageTitleRow>
                <TitleIcon>
                  <AssessmentOutlinedIcon fontSize="small" />
                </TitleIcon>
                <PageTitle>
                  <h1>Reports & Analytics</h1>
                  <p>Manage exam insights and student progress in real time.</p>
                </PageTitle>
              </PageTitleRow>
            </PageIntro>
            
            <HeaderRight>
              <ThemeToggle />
              <NotificationIcon type="button" aria-label="Notifications">
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </NotificationIcon>
              <DropdownContainer ref={dropdownRef}>
                <UserAvatar type="button" onClick={toggleDropdown} aria-label="User menu">
                  {getUserInitial()}
                </UserAvatar>
                {showDropdown && (
                  <Dropdown>
                    <DropdownItem>
                      <PersonOutlineOutlinedIcon fontSize="small" />
                      Profile
                    </DropdownItem>
                    <DropdownItem>
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
          
          <TabContainer>
            <Tab 
              type="button"
              $active={activeTab === 'examScores'} 
              onClick={() => setActiveTab('examScores')}
            >
              Exam Scores
            </Tab>
            <Tab 
              type="button"
              $active={activeTab === 'studentScores'} 
              onClick={() => setActiveTab('studentScores')}
            >
              Student Scores
            </Tab>
            <Tab 
              type="button"
              $active={activeTab === 'questionStats'} 
              onClick={() => setActiveTab('questionStats')}
            >
              Question Statistics
            </Tab>
          </TabContainer>
          
          {activeTab === 'examScores' ? renderExamStatistics() : 
           activeTab === 'studentScores' ? renderStudentScoreStatistics() :
           renderQuestionStatistics()}
        </MainContent>
        
        <ConfirmationModal
          isOpen={showLogoutConfirmation}
          onClose={() => setShowLogoutConfirmation(false)}
          onConfirm={handleConfirmLogout}
          message="Are you sure you want to logout?"
        />
      </ReportContainer>
  );
}

export default ReportPage; 
