import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import statisticsService from '../services/statisticsService';
import classService from '../services/classService';
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
  background: linear-gradient(135deg, ${props => props.theme === 'dark' ? 'rgba(141, 71, 255, 0.1)' : 'rgba(106, 126, 252, 0.05)'}, ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'});
  border: 1px solid ${props => props.theme === 'dark' ? 'rgba(141, 71, 255, 0.2)' : 'rgba(106, 126, 252, 0.1)'};
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(141, 71, 255, 0.1)' 
    : '0 8px 32px rgba(106, 126, 252, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)'};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100px;
    height: 100px;
    background: linear-gradient(45deg, ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'}, transparent);
    border-radius: 50%;
    opacity: 0.1;
    transition: all 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 12px 48px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(141, 71, 255, 0.2)' 
      : '0 12px 48px rgba(106, 126, 252, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)'};
    
    &::before {
      transform: scale(1.2);
      opacity: 0.15;
    }
  }
`;

const ClassHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.4)'};
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.6)'};
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
`;

const ClassName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const ClassScore = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: ${props => {
    const score = parseFloat(props.score);
    if (score >= 8.0) {
      return props.theme === 'dark' 
        ? 'linear-gradient(135deg, #4ade80, #22c55e)' 
        : 'linear-gradient(135deg, #10b981, #059669)';
    } else if (score >= 6.0) {
      return props.theme === 'dark' 
        ? 'linear-gradient(135deg, #facc15, #f59e0b)' 
        : 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
    return props.theme === 'dark' 
      ? 'linear-gradient(135deg, #f87171, #ef4444)' 
      : 'linear-gradient(135deg, #ef4444, #dc2626)';
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: ${props => props.theme === 'dark' 
    ? '0 2px 8px rgba(255, 255, 255, 0.1)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
`;

const ExamsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 1;
`;

const ScoreInfoCard = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(255, 255, 255, 0.6)'};
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 1rem;
  backdrop-filter: blur(15px);
  
  .main-score {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .score-breakdown {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .score-item {
    text-align: center;
    padding: 0.75rem;
    background: ${props => props.theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.3)'};
    border-radius: 0.75rem;
    border: 1px solid ${props => props.theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(255, 255, 255, 0.5)'};
  }
  
  .score-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
    margin-bottom: 0.25rem;
  }
  
  .score-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
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

const ClassNameLoading = styled.div`
  width: 120px;
  height: 20px;
  background: linear-gradient(90deg, 
    ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 25%, 
    ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'} 50%, 
    ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: loading 1.5s infinite;
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const ClassResultsTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 2rem 0 1rem 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'}, transparent);
    border-radius: 2px;
  }
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
  const [classNames, setClassNames] = useState({}); // Store class names by classId

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
        console.log('🔍 Full API response:', response.data);
        console.log('🔍 Response structure:', JSON.stringify(response.data, null, 2));
        console.log('🔍 ClassResults array:', response.data.classResults);
        setResults(response.data);
        setError(null);
        
        // Fetch class names for all classes
        if (response.data.classResults && response.data.classResults.length > 0) {
          const classIds = response.data.classResults.map(classResult => classResult.classId);
          console.log('🔍 Fetching names for class IDs:', classIds);
          await fetchClassNames(classIds);
        }
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

  // Fetch class names by class IDs
  const fetchClassNames = async (classIds) => {
    const newClassNames = {};
    
    try {
      // Thay vì gọi getClassById cho từng class (bị permission denied),
      // ta sẽ gọi getStudentClasses một lần để lấy tất cả classes của student
      console.log('🔍 Fetching all student classes to get class names...');
      const response = await classService.getStudentClasses(user.id, 0, 100); // Large size to get all classes
      
      if (response.data && response.data.content) {
        // Map class data by classId
        response.data.content.forEach(classData => {
          if (classIds.includes(classData.id)) {
            newClassNames[classData.id] = classData.name || `Class ${classData.id}`;
            console.log(`📚 Found class name for ${classData.id}:`, classData.name);
          }
        });
      }
      
      // Set fallback names for classes not found
      classIds.forEach(classId => {
        if (!newClassNames[classId]) {
          newClassNames[classId] = `Class ${classId}`;
          console.log(`📚 Using fallback name for class ${classId}`);
        }
      });
      
      setClassNames(prev => ({ ...prev, ...newClassNames }));
      console.log('📚 All class names updated:', newClassNames);
    } catch (err) {
      console.error('❌ Error fetching class names:', err);
      // Set fallback names for all classes
      const fallbackNames = {};
      classIds.forEach(classId => {
        fallbackNames[classId] = `Class ${classId}`;
      });
      setClassNames(prev => ({ ...prev, ...fallbackNames }));
    }
  };

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
    if (!results || !results.classResults || results.classResults.length === 0) {
      return 0;
    }
    
    const totalScore = results.classResults.reduce((sum, classResult) => sum + classResult.averageScore, 0);
    return (totalScore / results.classResults.length).toFixed(1);
  };

  // Count total classes
  const getTotalClasses = () => {
    if (!results || !results.classResults) {
      return 0;
    }
    return results.classResults.length;
  };

  // Count total exams (backend chỉ trả average score của class, không có exam details)
  const getTotalExams = () => {
    if (!results || !results.classResults) {
      return 0;
    }
    
    // Backend chỉ trả average score của class, không có individual exam scores
    // Tạm thời hiển thị số classes có điểm
    return results.classResults.length;
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

  // Function to get letter grade from 4-point scale score
  const getLetterGrade = (score4) => {
    if (score4 >= 3.5) return 'A';
    if (score4 >= 3.0) return 'B+';
    if (score4 >= 2.5) return 'B';
    if (score4 >= 2.0) return 'C+';
    if (score4 >= 1.5) return 'C';
    if (score4 >= 1.0) return 'D+';
    if (score4 >= 0.5) return 'D';
    return 'F';
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
        ) : !results || !results.classResults || results.classResults.length === 0 ? (
          <NoResultsContainer>
            <NoResultsIcon theme={theme}>📊</NoResultsIcon>
            <NoResultsText>No Results Available</NoResultsText>
            <NoResultsSubtext>You haven't completed any exams yet. Take exams to see your results here.</NoResultsSubtext>
          </NoResultsContainer>
        ) : (
          <>
            <StatsContainer>
              <StatCard theme={theme}>
                <StatValue theme={theme}>{calculateOverallAverage()}</StatValue>
                <StatLabel>Overall Average</StatLabel>
              </StatCard>
              
              <StatCard theme={theme}>
                <StatValue theme={theme}>{getTotalClasses()}</StatValue>
                <StatLabel>Total Classes</StatLabel>
              </StatCard>
              
              <StatCard theme={theme}>
                <StatValue theme={theme}>{getTotalExams()}</StatValue>
                <StatLabel>Classes with Scores</StatLabel>
              </StatCard>
            </StatsContainer>
            
            <ClassResultsTitle theme={theme}>Class Results</ClassResultsTitle>
            
            <ClassResultsContainer>
              {results.classResults.map((classResult, index) => (
                <ClassResultCard key={index} theme={theme}>
                  <ClassHeader>
                    {classNames[classResult.classId] ? (
                      <ClassName>{classNames[classResult.classId]}</ClassName>
                    ) : (
                      <ClassNameLoading theme={theme} />
                    )}
                    <ClassScore theme={theme} score={classResult.averageScore}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* <span>{classResult.averageScore.toFixed(1)} điểm</span> */}
                        <span style={{ 
                          // backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '1.8rem',
                          fontWeight: '700',
                          fontFamily: 'monospace'
                        }}>
                          {getLetterGrade(classResult.averageScoreIn4)}
                        </span>
                      </div>
                    </ClassScore>
                  </ClassHeader>
                  
                  <ExamsList>
                    <ScoreInfoCard theme={theme}>
                      <div className="main-score">
                        Average Score: {classResult.averageScore.toFixed(1)} 
                        {/* <span style={{ 
                          marginLeft: '0.5rem',
                          backgroundColor: 'rgba(106, 0, 255, 0.1)',
                          color: '#6a00ff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          fontFamily: 'monospace'
                        }}>
                          {getLetterGrade(classResult.averageScoreIn4 || 0)}
                        </span> */}
                      </div>
                      <div className="score-breakdown">
                        <div className="score-item">
                          <div className="score-value">
                            {classResult.averageScoreIn10?.toFixed(1) || 'N/A'}
                          </div>
                          <div className="score-label">10-point scale</div>
                        </div>
                        <div className="score-item">
                          <div className="score-value">
                            {classResult.averageScoreIn4?.toFixed(1) || 'N/A'}
                          </div>
                          <div className="score-label">4-point scale</div>
                        </div>
                      </div>
                    </ScoreInfoCard>
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