import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import studentExamService from '../services/studentExamService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useLoading } from '../contexts/LoadingContext';
import { SPACING_SCALE, RADIUS_SCALE, TYPOGRAPHY_SCALE } from '../theme/tokens';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: ${SPACING_SCALE.xl};
  transition: background-color 0.3s ease;
  position: relative;
`;

const ThemeToggleContainer = styled.div`
  position: absolute;
  top: ${SPACING_SCALE.md};
  right: ${SPACING_SCALE.md};
`;

const ContentContainer = styled.div`
  text-align: center;
  width: 100%;
  max-width: 480px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg, ${RADIUS_SCALE.lg});
  padding: ${SPACING_SCALE.lg};
  box-shadow: var(--card-shadow);
`;

const Welcome = styled.h1`
  font-size: ${TYPOGRAPHY_SCALE.lg};
  font-weight: 600;
  margin-bottom: ${SPACING_SCALE.xs};
  color: var(--text-primary);
`;

const ReadyMessage = styled.h2`
  font-size: ${TYPOGRAPHY_SCALE.md};
  font-weight: 500;
  margin-bottom: ${SPACING_SCALE.lg};
  color: var(--text-primary);
`;

const InstructionText = styled.p`
  font-size: ${TYPOGRAPHY_SCALE.sm};
  margin-bottom: ${SPACING_SCALE.md};
  line-height: 1.6;
  color: var(--text-secondary);
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: ${SPACING_SCALE.sm};
  margin-bottom: ${SPACING_SCALE.md};
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, ${RADIUS_SCALE.md});
  font-size: ${TYPOGRAPHY_SCALE.base};
  box-sizing: border-box;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--highlight-color);
    box-shadow: 0 0 0 2px rgba(106, 0, 255, 0.15);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${SPACING_SCALE.sm};
  margin-top: ${SPACING_SCALE.sm};
  width: 100%;
`;

const ReturnButton = styled.button`
  flex: 0 0 40%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, ${RADIUS_SCALE.md});
  padding: ${SPACING_SCALE.xs} ${SPACING_SCALE.md};
  font-size: ${TYPOGRAPHY_SCALE.xs};
  color: var(--text-secondary);
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(106, 126, 252, 0.08);
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(120deg, #4A4AFF, #6A7EFC);
  color: white;
  border: none;
  border-radius: var(--radius-pill, ${RADIUS_SCALE.pill});
  padding: ${SPACING_SCALE.xs} ${SPACING_SCALE.lg};
  font-size: ${TYPOGRAPHY_SCALE.sm};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex: 1;
  font-weight: 600;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(74, 74, 255, 0.25);
  }
  
  &:disabled {
    background: var(--border-color);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  margin-bottom: ${SPACING_SCALE.sm};
  font-size: ${TYPOGRAPHY_SCALE.sm};
`;

const InfoBox = styled.div`
  background-color: ${({ theme }) => (theme === 'dark' ? 'rgba(150, 120, 255, 0.1)' : 'rgba(106, 0, 255, 0.05)')};
  border-left: 3px solid var(--highlight-color);
  padding: ${SPACING_SCALE.sm} ${SPACING_SCALE.md};
  margin-top: ${SPACING_SCALE.md};
  font-size: ${TYPOGRAPHY_SCALE.xs};
  line-height: 1.6;
  color: var(--text-primary);
  text-align: left;
  border-radius: var(--radius-md, ${RADIUS_SCALE.md});
`;

function StartExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { disableLoader, enableLoader } = useLoading();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);
  const [examResponse, setExamResponse] = useState(null);

  useEffect(() => {
    disableLoader();
    return () => {
      enableLoader();
    };
  }, [disableLoader, enableLoader]);
  
  useEffect(() => {
    // Validate that we have an exam ID
    if (!examId) {
      setError('Exam ID is missing');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter the password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Gọi API start exam để kiểm tra
      const response = await studentExamService.startExam(examId, password);
      
      
      if (response && response.data && response.data.studentExam) {
        // Lưu response để sử dụng sau khi xác nhận
        setExamResponse(response.data);
        // Hiển thị modal xác nhận
        setShowStartConfirmation(true);
      } else {
        console.error('Invalid response structure:', response.data);
        setError('Failed to start exam. Invalid response from server.');
      }
    } catch (err) {
      console.error('Error starting exam:', err);
      
      // Handle specific error cases from the backend
      if (err.response && err.response.data && err.response.data.message) {
        const errorMessage = err.response.data.message;
        
        if (errorMessage.includes('Exam already started')) {
          setError('You have already started this exam. Please continue your existing session.');
        } else if (errorMessage.includes('Wrong password')) {
          setError('Incorrect password. Please check and try again.');
        } else if (errorMessage.includes('Student is not in class')) {
          setError('You are not enrolled in this class and cannot take this exam.');
        } else if (errorMessage.includes('Exam not found')) {
          setError('This exam does not exist or is no longer available.');
        } else {
          setError(errorMessage || 'Failed to start exam. Please try again.');
        }
      } else {
        setError(err.message || 'Failed to verify password. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm xử lý khi người dùng xác nhận bắt đầu làm bài
  const handleConfirmStart = () => {
    if (examResponse && examResponse.studentExam) {
      const studentExamId = examResponse.studentExam.id;
      
      if (studentExamId) {
        
        // Lưu studentExamId vào localStorage
        localStorage.setItem('currentStudentExamId', studentExamId);
        
        // Chuyển hướng đến trang làm bài
        navigate(`/take-exam/${examId}/questions`);
      }
    }
  };
  
  const getFullName = () => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      return `${firstName} ${lastName}`.trim() || user.username || 'User';
    }
    return 'User';
  };
  
  return (
    <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <ThemeToggleContainer>
        {/* <ThemeToggle /> */}
      </ThemeToggleContainer>
      
      <ContentContainer>
        <Welcome>Welcome {getFullName()},</Welcome>
        <ReadyMessage>Are you ready to take your exam?</ReadyMessage>
        
        <InstructionText>
          We have sent the password code to your<br />
          lecturer. Please ask them and enter the code<br />
          below to start the exam
        </InstructionText>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleSubmit}>
          <PasswordInput 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
          />
          
          <ButtonRow>
            <ReturnButton type="button" onClick={() => navigate('/exams')}>
              Back to Exams
            </ReturnButton>
            <LoginButton type="submit" disabled={loading}>
              {loading ? 'Starting...' : 'Start Exam'}
            </LoginButton>
          </ButtonRow>
        </form>
        
        <InfoBox theme={theme}>
          <strong>Note:</strong> Once you start the exam, you cannot pause or exit without submitting. 
          Make sure you have stable internet connection and enough time to complete.
        </InfoBox>
      </ContentContainer>
      
      {/* Modal xác nhận bắt đầu làm bài */}
      <ConfirmationModal
        isOpen={showStartConfirmation}
        onClose={() => setShowStartConfirmation(false)}
        onConfirm={handleConfirmStart}
        message="Are you sure you want to start exam?"
      />
    </PageContainer>
  );
}

export default StartExamPage; 
