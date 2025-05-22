import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import statisticsService from '../services/statisticsService';
import ConfirmationModal from '../components/common/ConfirmationModal';

// Styled Components
const PageContainer = styled.div`
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
  padding: 2rem 3rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
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
  color: var(--text-primary);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a00ff'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 100px;
    height: 100px;
    background-color: ${props => props.theme === 'dark' ? 'rgba(141, 71, 255, 0.05)' : 'rgba(106, 0, 255, 0.05)'};
    border-radius: 50%;
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a00ff'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const ClassResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ClassResultCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  
  &:hover {
    box-shadow: ${props => props.theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
    transform: translateY(-2px);
    transition: all 0.3s ease;
  }
`;

const ClassHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const ClassName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const ClassScore = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    const score = parseFloat(props.score);
    if (score >= 80) return props.theme === 'dark' ? '#4ade80' : '#10b981';
    if (score >= 60) return props.theme === 'dark' ? '#facc15' : '#f59e0b';
    return props.theme === 'dark' ? '#f87171' : '#ef4444';
  }};
`;

const ExamsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ExamItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const ExamName = styled.div`
  font-size: 0.95rem;
  color: var(--text-primary);
`;

const ExamScore = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => {
    const score = parseFloat(props.score);
    if (score >= 80) return props.theme === 'dark' ? '#4ade80' : '#10b981';
    if (score >= 60) return props.theme === 'dark' ? '#facc15' : '#f59e0b';
    return props.theme === 'dark' ? '#f87171' : '#ef4444';
  }};
`;

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  box-shadow: var(--card-shadow);
  text-align: center;
`;

const NoResultsIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a00ff'};
  opacity: 0.6;
`;

const NoResultsText = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const NoResultsSubtext = styled.div`
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.1rem;
  color: var(--text-secondary);
`;

function ResultsPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Fetch results when component mounts
  useEffect(() => {
    if (!user || user.role !== 'ROLE_STUDENT') {
      setError('Only students can view their results');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await statisticsService.getStudentScoreByClasses(user.id);
        console.log('Student results data:', response.data);
        setResults(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load your results. Please try again later.');
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  const handleLogout = (e) => {
    e.preventDefault();
    setShowLogoutConfirmation(true);
  };

  const handleConfirmLogout = () => {
    console.log('ResultsPage: Executing logout after confirmation');
    logout();
    setShowLogoutConfirmation(false);
  };

  // Get user's first initial for avatar
  const getUserInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'S';
  };

  // Get user's full name
  const getFullName = () => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      return `${firstName} ${lastName}`.trim() || user.username || 'Student';
    }
    return 'Student';
  };

  // Calculate average score across all classes
  const calculateOverallAverage = () => {
    if (!results || !results.classScores || results.classScores.length === 0) {
      return 0;
    }
    
    const totalScore = results.classScores.reduce((sum, classResult) => sum + classResult.averageScore, 0);
    return (totalScore / results.classScores.length).toFixed(1);
  };

  // Count total classes
  const getTotalClasses = () => {
    if (!results || !results.classScores) {
      return 0;
    }
    return results.classScores.length;
  };

  // Count total exams
  const getTotalExams = () => {
    if (!results || !results.classScores) {
      return 0;
    }
    
    return results.classScores.reduce((total, classResult) => {
      return total + (classResult.examScores ? classResult.examScores.length : 0);
    }, 0);
  };

  // Function to get icon for menu items
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

  // Function to check if a route is active
  const isRouteActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Format percentage score with color
  const formatScoreWithColor = (score) => {
    const numScore = parseFloat(score);
    let color;
    
    if (numScore >= 80) {
      color = theme === 'dark' ? '#4ade80' : '#10b981'; // Green
    } else if (numScore >= 60) {
      color = theme === 'dark' ? '#facc15' : '#f59e0b'; // Yellow/Orange
    } else {
      color = theme === 'dark' ? '#f87171' : '#ef4444'; // Red
    }
    
    return <span style={{ color }}>{numScore.toFixed(1)}%</span>;
  };

  return (
    <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <Sidebar theme={theme}>
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
          <NavItem to="#" onClick={handleLogout}>
            <NavIcon>{getMenuIcon('signout')}</NavIcon>
            Sign out
          </NavItem>
        </BottomMenu>
      </Sidebar>
      
      <MainContent>
        <Header>
          <PageTitle>My Results</PageTitle>
          
          <HeaderRight>
            <UserAvatar theme={theme}>{getUserInitial()}</UserAvatar>
          </HeaderRight>
        </Header>
        
        {loading ? (
          <LoadingContainer>
            Loading your results...
          </LoadingContainer>
        ) : error ? (
          <NoResultsContainer>
            <NoResultsIcon theme={theme}>⚠️</NoResultsIcon>
            <NoResultsText>Error Loading Results</NoResultsText>
            <NoResultsSubtext>{error}</NoResultsSubtext>
          </NoResultsContainer>
        ) : !results || !results.classScores || results.classScores.length === 0 ? (
          <NoResultsContainer>
            <NoResultsIcon theme={theme}>📊</NoResultsIcon>
            <NoResultsText>No Results Available</NoResultsText>
            <NoResultsSubtext>You haven't completed any exams yet. Take exams to see your results here.</NoResultsSubtext>
          </NoResultsContainer>
        ) : (
          <>
            <StatsContainer>
              <StatCard theme={theme}>
                <StatValue theme={theme}>{calculateOverallAverage()}%</StatValue>
                <StatLabel>Overall Average</StatLabel>
              </StatCard>
              
              <StatCard theme={theme}>
                <StatValue theme={theme}>{getTotalClasses()}</StatValue>
                <StatLabel>Total Classes</StatLabel>
              </StatCard>
              
              <StatCard theme={theme}>
                <StatValue theme={theme}>{getTotalExams()}</StatValue>
                <StatLabel>Total Exams</StatLabel>
              </StatCard>
            </StatsContainer>
            
            <h2>Class Results</h2>
            
            <ClassResultsContainer>
              {results.classScores.map((classResult, index) => (
                <ClassResultCard key={index} theme={theme}>
                  <ClassHeader>
                    <ClassName>{classResult.className || `Class ${index + 1}`}</ClassName>
                    <ClassScore theme={theme} score={classResult.averageScore}>
                      {classResult.averageScore.toFixed(1)}%
                    </ClassScore>
                  </ClassHeader>
                  
                  <ExamsList>
                    {classResult.examScores && classResult.examScores.length > 0 ? (
                      classResult.examScores.map((exam, examIndex) => (
                        <ExamItem key={examIndex} theme={theme}>
                          <ExamName>{exam.examName || `Exam ${examIndex + 1}`}</ExamName>
                          <ExamScore theme={theme} score={exam.score}>
                            {exam.score.toFixed(1)}%
                          </ExamScore>
                        </ExamItem>
                      ))
                    ) : (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No exam results for this class
                      </div>
                    )}
                  </ExamsList>
                </ClassResultCard>
              ))}
            </ClassResultsContainer>
          </>
        )}
      </MainContent>
      
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

export default ResultsPage; 