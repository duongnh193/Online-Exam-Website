import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import studentExamService from '../services/studentExamService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useLoading } from '../contexts/LoadingContext';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 20px;
  transition: background-color 0.3s ease;
`;

const ThemeToggleContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const ContentContainer = styled.div`
  text-align: center;
  width: 100%;
  max-width: 500px;
`;

const Welcome = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 10px;
  color: var(--text-primary);
`;

const ReadyMessage = styled.h2`
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 30px;
  color: var(--text-primary);
`;

const InstructionText = styled.p`
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
  color: var(--text-secondary);
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: var(--input-bg);
  color: var(--text-primary);
`;

const LoginButton = styled.button`
  background-color: #6a00ff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 40px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5500d0;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  margin-bottom: 20px;
  font-size: 14px;
`;

const InfoBox = styled.div`
  background-color: ${props => props.theme === 'dark' ? 'rgba(150, 120, 255, 0.1)' : 'rgba(106, 0, 255, 0.05)'};
  border-left: 3px solid var(--highlight-color);
  padding: 12px 16px;
  margin-top: 20px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
  text-align: left;
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
      
      console.log('Start exam response:', response.data);
      
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
        console.log('Starting exam with ID:', studentExamId);
        
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
          
          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Starting...' : 'Start Exam'}
          </LoginButton>
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
