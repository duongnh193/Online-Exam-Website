import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import studentExamService from '../services/studentExamService';
import questionService from '../services/questionService';
import examService from '../services/examService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';

// Styled Components for the new design
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-secondary);
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#333' : 'var(--bg-primary)'};
  border-radius: 20px;
  padding: 0.5rem 1rem;
  box-shadow: ${props => props.theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)'};
  width: 200px;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : 'transparent'};
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  color: var(--text-secondary);
  
  &::placeholder {
    color: #aaa;
  }
`;

const SearchIcon = styled.span`
  color: #aaa;
  margin-right: 0.5rem;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SubmitQuizButton = styled.button`
  background-color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#7d37ef' : '#586df5'};
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  color: var(--text-primary);
`;

const QuizHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  align-items: center;
`;

const QuizTitle = styled.h1`
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const TimerDisplay = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${props => props.timeRunningOut ? 
    (props.theme === 'dark' ? '#ff6666' : '#d32f2f') : 
    (props.theme === 'dark' ? '#ffffff' : '#333')};
  background: ${props => props.theme === 'dark' ? '#333' : 'white'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: ${props => props.theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)'};
`;

const QuizContent = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const QuestionInfo = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-weight: 500;
`;

const Instructions = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
`;

const QuestionContent = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const QuestionImage = styled.div`
  flex: 0 0 220px;
  
  img {
    width: 100%;
    border-radius: 8px;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    flex: auto;
    margin-bottom: 1rem;
  }
`;

const QuestionText = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AnswerOption = styled.label`
  display: flex;
  align-items: flex-start;
  padding: 0.7rem 1rem;
  border: 1px solid ${props => props.selected ? 
    (props.theme === 'dark' ? '#8d47ff' : '#6a7efc') : 
    (props.theme === 'dark' ? '#444' : '#eee')};
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.selected ? 
    (props.theme === 'dark' ? 'rgba(141, 71, 255, 0.1)' : 'rgba(106, 126, 252, 0.05)') : 
    (props.theme === 'dark' ? '#2a2a2a' : 'white')};
  
  &:hover {
    border-color: ${props => props.selected ? 
      (props.theme === 'dark' ? '#8d47ff' : '#6a7efc') : 
      (props.theme === 'dark' ? '#555' : '#ddd')};
    background-color: ${props => props.selected ? 
      (props.theme === 'dark' ? 'rgba(141, 71, 255, 0.15)' : 'rgba(106, 126, 252, 0.05)') : 
      (props.theme === 'dark' ? '#333' : '#fafafa')};
  }
`;

const RadioInput = styled.input`
  margin-right: 0.8rem;
  margin-top: 0.2rem;
`;

const CheckboxInput = styled.input`
  margin-right: 0.8rem;
  margin-top: 0.2rem;
`;

const EssayInput = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: var(--text-primary);
  
  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#aaa' : '#999'};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
  }
`;

const OptionText = styled.div`
  font-size: 0.95rem;
  color: var(--text-primary);
`;

const NavigationBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const SubmitButton = styled.button`
  padding: 0.7rem 2.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  background-color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
  color: white;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#7d37ef' : '#586df5'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  max-width: 500px;
  margin: 5rem auto;
  text-align: center;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  
  h2 {
    color: ${props => props.theme === 'dark' ? '#ff6666' : '#d32f2f'};
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
`;

const BackButton = styled.button`
  background-color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#7d37ef' : '#586df5'};
  }
`;

const ResultContainer = styled.div`
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  text-align: center;
  box-shadow: var(--card-shadow);
  color: var(--text-primary);
`;

const ScoreDisplay = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
  margin: 2rem 0;
`;

const ResultDetails = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  
  div {
    text-align: center;
    
    span {
      display: block;
      font-size: 2rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    
    label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
  }
`;

const CompletionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 3rem;
  background: linear-gradient(135deg, 
    ${props => props.theme === 'dark' ? 'rgba(141, 71, 255, 0.1)' : 'rgba(106, 126, 252, 0.05)'}, 
    ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'}
  );
  border: 1px solid ${props => props.theme === 'dark' ? 'rgba(141, 71, 255, 0.2)' : 'rgba(106, 126, 252, 0.1)'};
  border-radius: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.theme === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
    : '0 8px 32px rgba(106, 126, 252, 0.1)'};
`;

const CompletionIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`;

const CompletionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, 
    ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'}, 
    ${props => props.theme === 'dark' ? '#ff6b9d' : '#ff7eb3'}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CompletionMessage = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const CompletionSubmitButton = styled.button`
  padding: 1rem 3rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.1rem;
  background: linear-gradient(135deg, 
    ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'}, 
    ${props => props.theme === 'dark' ? '#7d37ef' : '#586df5'}
  );
  color: white;
  box-shadow: 0 4px 16px rgba(106, 126, 252, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(106, 126, 252, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

function TakeExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState({});
  const [essayAnswers, setEssayAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [studentExamId, setStudentExamId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [serverLastQuestionFlag, setServerLastQuestionFlag] = useState(false);
  const [resumingExam, setResumingExam] = useState(false);
  const [timeExpirationChecked, setTimeExpirationChecked] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [lastTabSwitchTime, setLastTabSwitchTime] = useState(null);

  useEffect(() => {
    if (!examId) return;
    examService.getExamById(examId)
      .then(res => {
        if (res.data && typeof res.data.totalQuestions === 'number') {
          setTotalQuestions(res.data.totalQuestions);
        } else {
          setTotalQuestions(null);
        }
      })
      .catch(err => {
        console.error('Failed to fetch exam for total questions:', err);
        setTotalQuestions(null);
      });
  }, [examId]);
  
  useEffect(() => {
    const storedStudentExamId = localStorage.getItem('currentStudentExamId');
    
    if (storedStudentExamId) {
      console.log('Retrieved student exam ID from localStorage:', storedStudentExamId);
      setStudentExamId(storedStudentExamId);
      
      setServerLastQuestionFlag(false);
      
      const resumeExam = async () => {
        try {
          setResumingExam(true);
          setLoading(true);
          
          const actualExamId = examId || storedStudentExamId.split('-')[1];
          console.log('Actual exam ID for password retrieval:', actualExamId);
          
          try {
            console.log('Retrieving password from backend API...');
            const password = await examService.getExamPassword(actualExamId);
            console.log('Password retrieved successfully from backend');
            
            if (password) {
              try {
                console.log(`Attempting to resume exam ${examId} with retrieved password`);
                const startResponse = await studentExamService.startExam(examId, password);
                
                if (startResponse && startResponse.data) {
                  const responseData = startResponse.data;
                  console.log('API response data:', responseData);
                  
                  const isLastQuestion = responseData.lastQuestion === true;
                  setServerLastQuestionFlag(isLastQuestion);
                  
                  if (responseData.studentExam?.exam?.questions?.length) {
                    const totalQuestionsCount = responseData.studentExam.exam.questions.length;
                    setTotalQuestions(totalQuestionsCount);
                    console.log(`Total questions count: ${totalQuestionsCount}`);
                  }
                  
                  if (responseData.studentExam?.currentQuestion !== undefined) {
                    const currentIndex = responseData.studentExam.currentQuestion;
                    setCurrentQuestionIndex(currentIndex);
                    console.log(`Current question index: ${currentIndex}`);
                    
                    if (storedStudentExamId) {
                      localStorage.setItem(`exam_current_question_${storedStudentExamId}`, currentIndex.toString());
                      console.log(`🔄 Resume: Updated localStorage currentQuestion from backend: ${currentIndex}`);
                    }
                  }
                  
                  if (responseData.secondRemaining !== undefined && responseData.secondRemaining !== null) {
                    setTimeRemaining(responseData.secondRemaining);
                    setTimeExpirationChecked(true);
                    console.log(`Time remaining: ${responseData.secondRemaining} seconds`);
                  }
                  
                  const allQuestions = [];
                  
                  if (responseData.studentExam?.exam?.questions && Array.isArray(responseData.studentExam.exam.questions)) {
                    console.log('All questions from API:', responseData.studentExam.exam.questions);
                    
                    responseData.studentExam.exam.questions.forEach((q, index) => {
                      const questionData = {
                        id: q.id,
                        text: q.title || q.text,
                        type: q.type,
                        imageUrl: q.image || q.imageUrl || q.img || q.imagePath || q.imageUri || null,
                        options: q.choices?.map(choice => {
                          if (typeof choice === 'string') {
                            return { id: choice, text: choice };
                          } else if (typeof choice === 'object') {
                            return {
                              id: choice.id || choice.optionKey || Math.random().toString(36).substring(2, 9),
                              text: choice.text || choice.content || choice.optionValue || String(choice)
                            };
                          } else {
                            return { id: String(choice), text: String(choice) };
                          }
                        }) || []
                      };
                      allQuestions.push(questionData);
                      console.log(`Added question ${index} with ID ${q.id} to local state`);
                    });
                  }
                  
                  if (responseData.nextQuestion) {
                    const questionData = responseData.nextQuestion;
                    console.log('Current question data from API:', questionData);
                    console.log('Image fields in question data:', {
                      image: questionData.image,
                      
                    });
                    
                    const mappedQuestion = {
                      id: questionData.id,
                      text: questionData.title,
                      type: questionData.type,
                      imageUrl: questionData.image || questionData.imageUrl || questionData.img || questionData.imagePath || questionData.imageUri || null,
                      options: questionData.choices?.map(choice => {
                        if (typeof choice === 'string') {
                          return { id: choice, text: choice };
                        } else if (typeof choice === 'object') {
                          return {
                            id: choice.id || choice.optionKey || Math.random().toString(36).substring(2, 9),
                            text: choice.text || choice.content || choice.optionValue || String(choice)
                          };
                        } else {
                          return { id: String(choice), text: String(choice) };
                        }
                      }) || []
                    };
                    
                    console.log('Processed question with image URL:', mappedQuestion.imageUrl);
                    console.log('Full processed question:', mappedQuestion);
                    
                    const existingIndex = allQuestions.findIndex(q => q.id === mappedQuestion.id);
                    if (existingIndex === -1) {
                      allQuestions.push(mappedQuestion);
                      console.log(`Added nextQuestion with ID ${mappedQuestion.id} to questions array`);
                    } else {
                      allQuestions[existingIndex] = mappedQuestion;
                      console.log(`Updated existing question with ID ${mappedQuestion.id}`);
                    }
                    
                    setQuestions(allQuestions);
                    console.log('🔄 Resume: Set questions array with length:', allQuestions.length);
                    console.log('🔄 Resume: Questions IDs:', allQuestions.map(q => q.id));
                    
                    if (responseData.nextQuestion && allQuestions.length > 0) {
                      const actualCurrentQID = responseData.nextQuestion.id;
                      const actualIndex = allQuestions.findIndex(q => q.id === actualCurrentQID);
                      
                      if (actualIndex !== -1) {
                        console.log('🔄 Resume: Setting currentQuestionIndex to actual position:', {
                          questionId: actualCurrentQID,
                          actualIndex: actualIndex,
                          backendIndex: responseData.studentExam?.currentQuestion,
                          questionsLength: allQuestions.length
                        });
                        setCurrentQuestionIndex(actualIndex);
                      } else {
                        console.warn('🔄 Resume: nextQuestion not found in allQuestions, defaulting to last index');
                        setCurrentQuestionIndex(allQuestions.length - 1);
                      }
                    } else {
                      console.log('🔄 Resume: No nextQuestion or empty questions array, setting index to 0');
                      setCurrentQuestionIndex(0);
                    }
                    
                    setLoading(false);
                  } else if (isLastQuestion) {
                    setError('You have reached the last question. Please submit your exam.');
                    setLoading(false);
                  } else {
                    setError('Could not retrieve the current question. Please try starting the exam again.');
                    setLoading(false);
                  }
                } else {
                  console.error('No data in API response');
                  setError('Could not retrieve exam data. Please try again.');
                  setLoading(false);
                }
              } catch (startErr) {
                console.error('Error using retrieved password:', startErr);
                handleResumeError(startErr);
              }
            } else {
              console.warn('No password retrieved from backend');
              setError('Could not retrieve exam password. Please start the exam again.');
              setLoading(false);
            }
          } catch (passwordErr) {
            console.error('Error retrieving password from backend:', passwordErr);
            setError('Could not retrieve exam password. Please start the exam again.');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error in resume exam flow:', err);
          handleResumeError(err);
        } finally {
          setResumingExam(false);
        }
      };
      
      const handleResumeError = (err) => {
        console.error('Resume error details:', err.response?.data || err.message);
        
        if (err.completed) {
          setError('This exam has already been completed or the time has expired.');
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to resume exam. Please try starting again.');
        }
        
        setLoading(false);
      };
      
      resumeExam();
    } else {
      setError('No active exam session found. Please start the exam again.');
      setLoading(false);
    }
  }, [examId]);
  
  useEffect(() => {
    if (timeRemaining === null || loading || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        
        if (prevTime % 30 === 0 && studentExamId) {
          localStorage.setItem(`exam_time_remaining_${studentExamId}`, prevTime.toString());
          localStorage.setItem(`exam_time_last_updated_${studentExamId}`, Date.now().toString());
        }
        
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, loading, studentExamId]);

  useEffect(() => {
    if (!studentExamId || showResults || examCompleted || loading) return;

    let isTabActive = true;

    const handleTabSwitch = async () => {
      console.log('🚨 Tab switch detected - calling checkTab API immediately');

      try {
        await studentExamService.checkTab(studentExamId);
        console.log('✅ Tab switch recorded successfully');
      } catch (error) {
        console.error('❌ Failed to record tab switch:', error);
      }
    };

    const handleVisibilityChange = () => {
      const isHidden = document.hidden || document.visibilityState === 'hidden';
      
      if (isHidden && isTabActive) {
        console.log('👁️ Page became hidden - tab switch detected');
        isTabActive = false;
        
        handleTabSwitch();
      } else if (!isHidden && !isTabActive) {
        console.log('👁️ Page became visible again');
        isTabActive = true;
      }
    };

    const handleWindowBlur = () => {
      if (isTabActive) {
        console.log('🔄 Window lost focus - tab switch detected');
        isTabActive = false;
        
        handleTabSwitch();
      }
    };

    const handleWindowFocus = () => {
      console.log('🔄 Window gained focus');
      isTabActive = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [studentExamId, showResults, examCompleted, loading]);
  
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--Mins';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}Mins`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}Mins`;
    }
  };

  const handleSingleChoiceSelect = (questionId, optionId) => {
    if (!questionId || !optionId) return;
    
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    const selectedOption = currentQuestion.options?.find(opt => opt.id === optionId);
    if (!selectedOption) return;
    
    setAnswers({
      ...answers,
      [questionId]: {
        id: optionId,
        text: selectedOption.text || ''
      }
    });
  };
  
  const handleMultipleChoiceSelect = (questionId, optionId) => {
    if (!questionId || !optionId) return;
    
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    const currentSelections = multipleChoiceAnswers[questionId] || [];
    let updatedSelections;
    
    if (currentSelections.some(item => item.id === optionId)) {
      updatedSelections = currentSelections.filter(item => item.id !== optionId);
    } else {
      const selectedOption = currentQuestion.options?.find(opt => opt.id === optionId);
      if (!selectedOption) return;
      
      updatedSelections = [
        ...currentSelections,
        {
          id: optionId,
          text: selectedOption.text || ''
        }
      ];
    }
    
    setMultipleChoiceAnswers({
      ...multipleChoiceAnswers,
      [questionId]: updatedSelections
    });
  };
  
  const handleEssayChange = (questionId, text) => {
    setEssayAnswers({
      ...essayAnswers,
      [questionId]: text
    });
  };
  
  const submitSingleChoiceAnswer = (questionId) => {
    const selectedOption = answers[questionId];
    if (!selectedOption) {
      alert('Please select an answer');
      return;
    }
    
    console.log(`Submitting single choice answer - Question ${questionId}, Selected option:`, selectedOption);
    
    const answerContent = selectedOption.text;
    
    if (serverLastQuestionFlag) {
      submitAnswer(questionId, answerContent, true);
    } else {
      submitAnswer(questionId, answerContent);
    }
  };
  
  const submitMultipleChoiceAnswer = (questionId) => {
    const selections = multipleChoiceAnswers[questionId] || [];
    if (selections.length === 0) {
      alert('Please select at least one answer');
      return;
    }
    
    const answerContents = selections.map(option => option.text);
    
    const answer = answerContents.join(', ');
    console.log(`Submitting multiple choice answer - Question ${questionId}, Selected options:`, answer);
    
    if (serverLastQuestionFlag) {
      submitAnswer(questionId, answer, true);
    } else {
      submitAnswer(questionId, answer);
    }
  };
  
  const submitEssayAnswer = (questionId) => {
    const text = essayAnswers[questionId] || '';
    if (!text.trim()) {
      alert('Please write your answer');
      return;
    }
    
    console.log(`Submitting essay answer - Question ${questionId}, Text length: ${text.length} chars`);
    
    if (serverLastQuestionFlag) {
      submitAnswer(questionId, text, true);
    } else {
      submitAnswer(questionId, text);
    }
  };
  
  const submitAnswer = async (questionId, answer, isLastQuestion = false) => {
    if (loading) return;
    
    if (localStorage.getItem(`exam_submitting_${studentExamId}`) === 'true') {
      console.log('Exam is being submitted, skipping individual answer submission');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`--- SUBMITTING ANSWER DETAILS ---`);
      console.log(`Question ID: ${questionId}`);
      console.log(`Answer value: ${answer}`);
      console.log(`Student Exam ID: ${studentExamId}`);
      console.log(`Is Last Question: ${isLastQuestion}`);
      
      const response = await studentExamService.submitAnswer(studentExamId, questionId, answer);
      console.log('Answer submitted successfully', response.data);
      
      if (response && response.data) {
        const responseData = response.data;
        
        const isLastQuestion = responseData.lastQuestion === true;
        console.log('Server response lastQuestion flag:', isLastQuestion);
        
        setServerLastQuestionFlag(isLastQuestion);
        
        if (isLastQuestion) {
          console.log('🎉 Exam completed! Setting examCompleted to true');
          setExamCompleted(true);
          setLoading(false);
          return;
        }
        
        if (responseData.studentExam?.exam?.questions?.length) {
          const count = responseData.studentExam.exam.questions.length;
          console.log(`Setting total questions count: ${count}`);
          setTotalQuestions(count);
        }
        
        if (responseData.studentExam?.currentQuestion !== undefined && studentExamId) {
          const backendCurrentQuestion = responseData.studentExam.currentQuestion;
          localStorage.setItem(`exam_current_question_${studentExamId}`, backendCurrentQuestion.toString());
          console.log(`🔄 Updated localStorage currentQuestion from backend: ${backendCurrentQuestion}`);
        }
        
        if (!responseData.nextQuestion || !responseData.nextQuestion.id) {
          if (isLastQuestion) {
            console.log('No next question, and server confirms this is the last question');
          } else {
            console.warn('No next question but lastQuestion is false - unexpected state');
          }
          setLoading(false);
          return;
        }
        
        const nextQuestion = {
          id: responseData.nextQuestion.id,
          text: responseData.nextQuestion.title,
          type: responseData.nextQuestion.type,
          imageUrl: responseData.nextQuestion.image || responseData.nextQuestion.imageUrl || responseData.nextQuestion.img || responseData.nextQuestion.imagePath || responseData.nextQuestion.imageUri || null,
          options: responseData.nextQuestion.choices?.map(choice => {
            if (typeof choice === 'string') {
              return { id: choice, text: choice };
            } else if (typeof choice === 'object') {
              return {
                id: choice.id || choice.optionKey || Math.random().toString(36).substring(2, 9),
                text: choice.text || choice.content || choice.optionValue || JSON.stringify(choice)
              };
            } else {
              return { id: String(choice), text: String(choice) };
            }
          }) || []
        };
        
        console.log('Next question image from submitAnswer:', {
          originalImage: responseData.nextQuestion.image,
          processedImageUrl: nextQuestion.imageUrl,
          questionId: nextQuestion.id
        });
        
        setQuestions(prev => {
          const existingIndex = prev.findIndex(q => q.id === nextQuestion.id);
          
          let updatedQuestions;
          if (existingIndex !== -1) {
            updatedQuestions = [...prev];
            updatedQuestions[existingIndex] = nextQuestion;
            console.log('🔄 Questions Updated (replaced):', {
              index: existingIndex,
              questionId: nextQuestion.id,
              totalLength: updatedQuestions.length
            });
          } else {
            updatedQuestions = [...prev, nextQuestion];
            console.log('🔄 Questions Updated (added):', {
              previousLength: prev.length,
              newLength: updatedQuestions.length,
              newQuestionId: nextQuestion.id,
              newQuestionText: nextQuestion.text?.substring(0, 50)
            });
          }
          
          return updatedQuestions;
        });
        
        setCurrentQuestionIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          console.log('🔄 Index Update:', {
            from: prevIndex,
            to: newIndex,
            nextQuestionId: nextQuestion.id,
            nextQuestionText: nextQuestion.text?.substring(0, 50),
            questionsAfterUpdate: 'Will be updated after questions state updates'
          });
          return newIndex;
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (studentExamId && !showResults) {
        try {
          const syncRequest = new XMLHttpRequest();
          const url = `http://localhost:8080/api/v1/student-exams/submit?studentExamId=${encodeURIComponent(studentExamId)}`;
          
          let authToken = localStorage.getItem('token');
          
          syncRequest.open('POST', url, false);
          if (authToken) {
            syncRequest.setRequestHeader('Authorization', `Bearer ${authToken}`);
          }
          syncRequest.setRequestHeader('Content-Type', 'application/json');
          syncRequest.send();
          
          const examIdParts = studentExamId.split('-');
          if (examIdParts.length > 1) {
            const examId = examIdParts[1];
            const completedExams = JSON.parse(localStorage.getItem('completedExams') || '{}');
            completedExams[examId] = true;
            localStorage.setItem('completedExams', JSON.stringify(completedExams));
          }
        } catch (err) {
          console.error('Error auto-submitting exam on page leave:', err);
        }
      }
      
      event.preventDefault();
      event.returnValue = 'You have unsaved exam progress. Are you sure you want to leave?';
    };
    
    if (studentExamId && !showResults) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [studentExamId, showResults]);

  const getUserInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'S';
  };
  
  const getUserName = () => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      return user.username || 'Student';
    }
    return 'Student';
  };

  const handleSubmitExam = () => {
    if (!studentExamId) {
      setError('No active exam session found');
      return;
    }
    
    setShowSubmitConfirmation(true);
  };
  
  const handleConfirmSubmit = async () => {
    try {
      setLoading(true);
      
      localStorage.setItem(`exam_submitting_${studentExamId}`, 'true');
      
      console.log('Submitting entire exam to server...', 'Current student exam ID:', studentExamId);
      const response = await studentExamService.submitExam(studentExamId);
      console.log('Exam submitted successfully:', response.data);
      
      console.log('Raw response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.answers) {
        console.log('Answer details:', response.data.answers);
      }
      
      if (response.data.questions) {
        console.log('Question details:', response.data.questions);
      }
      
      if (response.data.correctAnswers !== undefined) {
        console.log('Correct answers count:', response.data.correctAnswers);
        console.log('Wrong answers count:', response.data.wrongAnswers);
        console.log('Total questions:', response.data.totalQuestions);
      }
      
      if (response.data) {
        const result = {
          correctAnswers: response.data.correctAnswers || 0,
          wrongAnswers: response.data.wrongAnswers || 0,
          totalQuestions: response.data.totalQuestions || 0,
          score: response.data.score || 0,
          duration: response.data.duration || 0
        };
        
        console.log('Final exam result being set:', result);
        console.log('📊 Score Calculation Info:', {
          correctAnswers: result.correctAnswers,
          totalQuestions: result.totalQuestions,
          rawScore: result.score,
          scoreDisplay: `${result.score.toFixed(1)} điểm`,
          calculationMethod: '(correctAnswers * 10.0) / totalQuestions'
        });
        
        setExamResult(result);
        setShowResults(true);
        
        localStorage.removeItem('currentStudentExamId');
        localStorage.removeItem('examSession');
        localStorage.removeItem(`exam_submitting_${studentExamId}`);
      } else {
        setError('Received invalid response from server');
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      
      localStorage.removeItem(`exam_submitting_${studentExamId}`);
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        if (err.response.data && err.response.data.message) {
          setError(`Failed to submit exam: ${err.response.data.message}`);
        } else {
          setError('Failed to submit exam. Please try again.');
        }
      } else if (err.message) {
        setError(`Failed to submit exam: ${err.message}`);
      } else {
        setError('Failed to submit exam. Please try again.');
      }
    } finally {
      setLoading(false);
      setShowSubmitConfirmation(false);
    }
  };

  const ExamResultsScreen = () => {
    if (!examResult) return null;
    
    return (
      <ResultContainer theme={theme}>
        <h2>Quiz Completed</h2>
        
        <ScoreDisplay theme={theme}>
          {examResult.score.toFixed(1)} 
        </ScoreDisplay>
        
        <ResultDetails>
          <div>
            <span>{examResult.correctAnswers}</span>
            <label>Correct</label>
          </div>
          <div>
            <span>{examResult.wrongAnswers}</span>
            <label>Wrong</label>
          </div>
          <div>
            <span>{examResult.totalQuestions}</span>
            <label>Total</label>
          </div>
        </ResultDetails>
        
        {examResult.answerResults && examResult.answerResults.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Answer Details</h3>
            {examResult.answerResults.map((result, index) => (
              <div key={index} style={{ 
                margin: '1rem 0', 
                padding: '1rem', 
                borderRadius: '8px',
                backgroundColor: result.correct ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                border: `1px solid ${result.correct ? '#4CAF50' : '#F44336'}`
              }}>
                <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                  Question {index + 1}: {result.questionText || `Question ${result.questionId}`}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Your answer:</span> {result.studentAnswer || 'No answer'}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Correct answer:</span> {result.correctAnswer || 'Not available'}
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  color: result.correct ? '#4CAF50' : '#F44336',
                  fontWeight: '500'
                }}>
                  {result.correct ? '✓ Correct' : '✗ Wrong'}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <BackButton theme={theme} onClick={() => navigate('/exams')}>
          Back to Exams
        </BackButton>
      </ResultContainer>
    );
  };
  
  const ExamCompletionScreen = () => {
    return (
      <CompletionContainer theme={theme}>
        <CompletionIcon>🎉</CompletionIcon>
        <CompletionTitle theme={theme}>Exam Completed!</CompletionTitle>
        <CompletionMessage>
          You have successfully completed all questions in this exam. 
          Please click the submit button below to finalize your answers and view your results.
        </CompletionMessage>
        <CompletionSubmitButton theme={theme} onClick={handleSubmitExam}>
          Submit Exam
        </CompletionSubmitButton>
      </CompletionContainer>
    );
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        Loading quiz...
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <ErrorContainer theme={theme}>
        <h2>Error</h2>
        <p>{error}</p>
        <BackButton theme={theme} onClick={() => navigate('/exams')}>
          Back to Exams
        </BackButton>
      </ErrorContainer>
    );
  }
  
  if (showResults) {
    return <ExamResultsScreen />;
  }

  const timeRunningOut = timeRemaining !== null && timeRemaining < 300;

  if (examCompleted) {
    return (
      <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        <Header>
          <SearchContainer theme={theme}>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput placeholder="Search..." />
          </SearchContainer>
          
          <ActionButtons>
            <UserProfile>
              <span>{getUserName()}</span>
              <UserAvatar theme={theme}>{getUserInitial()}</UserAvatar>
            </UserProfile>
          </ActionButtons>
        </Header>
        
        <MainContent>
          <QuizHeader>
            <QuizTitle>Quiz</QuizTitle>
            <TimerDisplay timeRunningOut={timeRunningOut} theme={theme}>
              Timer: {formatTime(timeRemaining)}
            </TimerDisplay>
          </QuizHeader>
          
          <QuizContent>
            <ExamCompletionScreen />
          </QuizContent>
        </MainContent>
        
        <ConfirmationModal
          isOpen={showSubmitConfirmation}
          onClose={() => setShowSubmitConfirmation(false)}
          onConfirm={handleConfirmSubmit}
          message="Are you sure you want to submit Quiz?"
        />
      </PageContainer>
    );
  }
  
  if (questions.length === 0) {
    return (
      <ErrorContainer theme={theme}>
        <h2>No Questions Available</h2>
        <p>There was an issue loading the questions for this quiz.</p>
        <BackButton theme={theme} onClick={() => navigate('/exams')}>
          Back to Exams
        </BackButton>
      </ErrorContainer>
    );
  }
  
  const currentQuestion = questions.length > 0 
    ? (questions[currentQuestionIndex] || questions[0]) 
    : null;
  
  console.log('🐛 RENDER STATE DEBUG:', {
    currentQuestionIndex,
    questionsLength: questions.length,
    currentQuestionId: currentQuestion?.id,
    currentQuestionText: currentQuestion?.text?.substring(0, 50),
    currentQuestionImageUrl: currentQuestion?.imageUrl,
    serverLastQuestionFlag,
    loading,
    questionsIds: questions.map(q => q.id)
  });
  
  const isLastQuestion = serverLastQuestionFlag;
  
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;
    
    switch (currentQuestion.type) {
      case 'ESSAY':
        return (
          <div>
            <EssayInput
              theme={theme}
              value={essayAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleEssayChange(currentQuestion.id, e.target.value)}
              placeholder="Write your answer here..."
            />
            <NavigationBar>
              {serverLastQuestionFlag ? (
                <>
                  <div style={{ 
                    marginRight: 'auto', 
                    backgroundColor: '#f0f8ff', 
                    padding: '10px 15px',
                    borderRadius: '8px',
                    color: '#4b6dcc',
                    fontWeight: '500'
                  }}>
                    🎉 You've completed the exam! Please click Submit to finish.
                  </div>
                  <SubmitButton onClick={handleSubmitExam}>
                    Submit
                  </SubmitButton>
                </>
              ) : (
                <SubmitButton onClick={() => submitEssayAnswer(currentQuestion.id)}>
                  Next
                </SubmitButton>
              )}
            </NavigationBar>
          </div>
        );
        
      case 'MULTIPLE_CHOICE':
        return (
          <>
            <AnswerOptions>
              {(currentQuestion.options || []).map(option => (
                <AnswerOption 
                  key={option.id || 'unknown'}
                  selected={(multipleChoiceAnswers[currentQuestion.id] || []).some(item => item.id === option.id)}
                  theme={theme}
                >
                  <CheckboxInput 
                    type="checkbox"
                    name={`question-${currentQuestion.id}-option-${option.id || 'unknown'}`}
                    checked={(multipleChoiceAnswers[currentQuestion.id] || []).some(item => item.id === option.id)}
                    onChange={() => handleMultipleChoiceSelect(currentQuestion.id, option.id)}
                  />
                  <OptionText>
                    {typeof option.text === 'string' ? option.text : 
                     typeof option.text === 'object' ? JSON.stringify(option.text) : 
                     String(option.text || '')}
                  </OptionText>
                </AnswerOption>
              ))}
            </AnswerOptions>
            <NavigationBar>
              {serverLastQuestionFlag ? (
                <>
                  <div style={{ 
                    marginRight: 'auto', 
                    backgroundColor: '#f0f8ff', 
                    padding: '10px 15px',
                    borderRadius: '8px',
                    color: '#4b6dcc',
                    fontWeight: '500'
                  }}>
                    🎉 You've completed the exam! Please click Submit to finish.
                  </div>
                  <SubmitButton onClick={handleSubmitExam}>
                    Submit
                  </SubmitButton>
                </>
              ) : (
                <SubmitButton onClick={() => submitMultipleChoiceAnswer(currentQuestion.id)}>
                  Next
                </SubmitButton>
              )}
            </NavigationBar>
          </>
        );
        
      case 'SINGLE_CHOICE':
      default:
        return (
          <>
            <AnswerOptions>
              {(currentQuestion.options || []).map(option => (
                <AnswerOption 
                  key={option.id || 'unknown'}
                  selected={answers[currentQuestion.id] && answers[currentQuestion.id].id === option.id}
                  theme={theme}
                  onClick={() => handleSingleChoiceSelect(currentQuestion.id, option.id)}
                >
                  <RadioInput 
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] && answers[currentQuestion.id].id === option.id}
                    onChange={() => {}}
                  />
                  <OptionText>
                    {typeof option.text === 'string' ? option.text : 
                     typeof option.text === 'object' ? JSON.stringify(option.text) : 
                     String(option.text || '')}
                  </OptionText>
                </AnswerOption>
              ))}
            </AnswerOptions>
            <NavigationBar>
              {serverLastQuestionFlag ? (
                <>
                  <div style={{ 
                    marginRight: 'auto', 
                    backgroundColor: '#f0f8ff', 
                    padding: '10px 15px',
                    borderRadius: '8px',
                    color: '#4b6dcc',
                    fontWeight: '500'
                  }}>
                    🎉 You've completed the exam! Please click Submit to finish.
                  </div>
                  <SubmitButton onClick={handleSubmitExam}>
                    Submit
                  </SubmitButton>
                </>
              ) : (
                <SubmitButton theme={theme} onClick={() => submitSingleChoiceAnswer(currentQuestion.id)}>
                  Next
                </SubmitButton>
              )}
            </NavigationBar>
          </>
        );
    }
  };
  
  return (
    <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <Header>
        <SearchContainer theme={theme}>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput placeholder="Search..." />
        </SearchContainer>
        
        <ActionButtons>
            <SubmitQuizButton onClick={handleSubmitExam}>
              Submit Quiz
            </SubmitQuizButton>
            <UserProfile>
              <span>{getUserName()}</span>
              <UserAvatar theme={theme}>{getUserInitial()}</UserAvatar>
            </UserProfile>
          </ActionButtons>
        </Header>
        
        <MainContent>
          <QuizHeader>
            <QuizTitle>Quiz</QuizTitle>
            <TimerDisplay timeRunningOut={timeRunningOut} theme={theme}>
              Timer: {formatTime(timeRemaining)}
            </TimerDisplay>
          </QuizHeader>
          
          {currentQuestion ? (
            <QuizContent>
              <QuestionInfo>
                {(() => {
                  const examSessionId = studentExamId || localStorage.getItem('currentStudentExamId');
                  const backendQuestionIndex = localStorage.getItem(`exam_current_question_${examSessionId}`);
                  let questionNumber = currentQuestionIndex + 1;
                  if (backendQuestionIndex !== null && !isNaN(parseInt(backendQuestionIndex))) {
                    questionNumber = parseInt(backendQuestionIndex) + 1;
                  } else if (questions.length > 0 && currentQuestion) {
                    const actualPosition = questions.findIndex(q => q.id === currentQuestion.id);
                    if (actualPosition !== -1) {
                      questionNumber = actualPosition + 1;
                    }
                  }
                  return serverLastQuestionFlag
                    ? `Question ${questionNumber}${typeof totalQuestions === 'number' && totalQuestions > 0 ? '/' + totalQuestions : ''} (Last question)`
                    : `Question ${questionNumber}${typeof totalQuestions === 'number' && totalQuestions > 0 ? '/' + totalQuestions : ''}`;
                })()}
              </QuestionInfo>
              
              <Instructions>
                Answer the question below
              </Instructions>
              
              <QuestionContent>
                <QuestionImage>
                  {currentQuestion.imageUrl ? (
                    <img src={currentQuestion.imageUrl} alt="Quiz question illustration" />
                  ) : (
                    <div style={{ 
                      width: '220px', 
                      height: '280px', 
                      backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5', 
                      borderRadius: '8px' 
                    }} />
                  )}
                </QuestionImage>
                
                <div>
                  <QuestionText>
                    {currentQuestion.text || "Loading question..."}
                  </QuestionText>
                  
                  {renderQuestionInput()}
                </div>
              </QuestionContent>
            </QuizContent>
          ) : (
            <QuizContent>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading question data... If this takes too long, please refresh the page.</p>
              </div>
            </QuizContent>
          )}
        </MainContent>
        
        <ConfirmationModal
          isOpen={showSubmitConfirmation}
          onClose={() => setShowSubmitConfirmation(false)}
          onConfirm={handleConfirmSubmit}
          message="Are you sure you want to submit Quiz?"
        />
      </PageContainer>
    );
}

export default TakeExamPage; 