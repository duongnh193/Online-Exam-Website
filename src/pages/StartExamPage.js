import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import studentExamService from '../services/studentExamService';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
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
`;

const ReadyMessage = styled.h2`
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 30px;
`;

const InstructionText = styled.p`
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
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
  background-color: rgba(106, 0, 255, 0.05);
  border-left: 3px solid #6a00ff;
  padding: 12px 16px;
  margin-top: 20px;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  text-align: left;
`;

function StartExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Try to check if this exam was already completed by the student
  const checkIfCompleted = async () => {
    try {
      if (!user) return false;
      
      // Get the current student's ID from the user object
      const studentId = user.id || user.userId;
      console.log('Current user ID:', studentId);
      
      if (studentId) {
        // Use the new checkExamInProgress method
        const examStatus = await studentExamService.checkExamInProgress(studentId, examId);
        console.log('Exam status check result:', examStatus);
        
        // Handle completed exams
        if (examStatus.completed) {
          setError('You have already completed this exam and cannot retake it.');
          return true;
        }
        
        // Handle in-progress exams
        if (examStatus.inProgress) {
          const continueExam = window.confirm(
            'You have an in-progress exam session. Do you want to continue where you left off?'
          );
          
          if (continueExam) {
            // Store the exam session ID and navigate directly to the exam page
            localStorage.setItem('currentStudentExamId', examStatus.examSessionId);
            
            // Create a minimal exam session object
            localStorage.setItem('examSession', JSON.stringify({
              studentExamId: examStatus.examSessionId,
              examId: examId
            }));
            
            // Navigate to the exam questions page
            navigate(`/take-exam/${examId}/questions`);
            return true;
          }
          // If user chooses not to continue, we'll let them enter the password again
        }
        
        // If we get here and there was an error but not a "not found" error,
        // we should handle it quietly - the exam is probably not started yet
        if (examStatus.error && !examStatus.notFound) {
          console.warn('Non-fatal error checking exam status:', examStatus.errorMessage);
          // Don't show error to the user - just let them proceed to enter the password
        }
      }
      
      return false;
    } catch (err) {
      console.error('Error checking exam status:', err);
      // Don't show errors to the user, just let them try to start the exam
      return false;
    }
  };
  
  useEffect(() => {
    // Validate that we have an exam ID and check if already completed
    if (!examId) {
      setError('Exam ID is missing');
      return;
    }

    // Check if exam is already completed when component mounts
    const checkStatus = async () => {
      await checkIfCompleted();
    };
    
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, user]);
  
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
      // First check if the exam is already in progress
      const userId = user.id || user.userId;
      if (userId) {
        // Use the improved checkExamInProgress method
        const examStatus = await studentExamService.checkExamInProgress(userId, examId);
        
        if (examStatus.completed) {
          setError('You have already completed this exam and cannot retake it.');
          setLoading(false);
          return;
        }
        
        if (examStatus.inProgress) {
          const continueExam = window.confirm(
            'You have an in-progress exam session. Do you want to continue where you left off?'
          );
          
          if (continueExam) {
            // Store the exam session ID and navigate directly to the exam page
            localStorage.setItem('currentStudentExamId', examStatus.examSessionId);
            
            // Navigate to the exam questions page
            navigate(`/take-exam/${examId}/questions`);
            return;
          }
          // If user chooses not to continue, let them enter the password again
          // but warn that continuing will override their previous session
          setError('Warning: Starting a new session will override your previous progress.');
          setLoading(false);
          return;
        }
      }
      
      // Call the student exam API to start the exam with password
      const response = await studentExamService.startExam(examId, password);
      
      console.log('Start exam response:', response.data);
      
      if (response && response.data && response.data.studentExam) {
        // The ID is within the studentExam object in the response
        const studentExamId = response.data.studentExam.id;
        
        if (studentExamId) {
          console.log('Found student exam ID:', studentExamId);
          
          // Extract the first question properly
          if (response.data.nextQuestion) {
            console.log('First question found:', response.data.nextQuestion);
          } else {
            console.warn('No first question in the response');
          }
          
          // Store minimal necessary data in localStorage
          localStorage.setItem('currentStudentExamId', studentExamId);
          localStorage.setItem('examSession', JSON.stringify({
            studentExamId: studentExamId,
            currentQuestion: response.data.nextQuestion,
            lastQuestion: response.data.lastQuestion === true
          }));
          
          // Navigate to the exam questions page
          navigate(`/take-exam/${examId}/questions`);
        } else {
          console.error('Missing ID in studentExam object:', response.data);
          setError('Invalid response from server. Missing exam session ID.');
        }
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
  
  const getFullName = () => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      return `${firstName} ${lastName}`.trim() || user.username || 'User';
    }
    return 'User';
  };
  
  return (
    <PageContainer>
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
            {loading ? 'Verifying...' : 'Login'}
          </LoginButton>
        </form>
        
        <InfoBox>
          <strong>Note:</strong> This password is specific to this exam session and 
          is provided by your lecturer. If you don't have the password, please 
          contact your lecturer directly.
        </InfoBox>
      </ContentContainer>
    </PageContainer>
  );
}

export default StartExamPage; 