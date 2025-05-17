import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import studentExamService from '../services/studentExamService';
import questionService from '../services/questionService';

// Styled Components for the new design
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 200px;
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  color: #666;
  
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
  background-color: #6a7efc;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #586df5;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #333;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #333;
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
  color: #333;
`;

const TimerDisplay = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${props => props.timeRunningOut ? '#d32f2f' : '#333'};
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const QuizContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
`;

const QuestionInfo = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const Instructions = styled.p`
  font-size: 0.9rem;
  color: #666;
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
  color: #333;
  margin-bottom: 1.5rem;
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
  border: 1px solid ${props => props.selected ? '#6a7efc' : '#eee'};
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.selected ? 'rgba(106, 126, 252, 0.05)' : 'white'};
  
  &:hover {
    border-color: ${props => props.selected ? '#6a7efc' : '#ddd'};
    background-color: ${props => props.selected ? 'rgba(106, 126, 252, 0.05)' : '#fafafa'};
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
  border: 1px solid #eee;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #6a7efc;
  }
`;

const OptionText = styled.div`
  font-size: 0.95rem;
  color: #333;
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
  background-color: #6a7efc;
  color: white;
  
  &:hover {
    background-color: #586df5;
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
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #d32f2f;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
  }
`;

const BackButton = styled.button`
  background-color: #6a7efc;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
`;

const ResultContainer = styled.div`
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ScoreDisplay = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  color: #6a7efc;
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
      color: #333;
      margin-bottom: 0.5rem;
    }
    
    label {
      font-size: 0.9rem;
      color: #666;
    }
  }
`;

function TakeExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0); // Track total questions
  const [answers, setAnswers] = useState({});
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState({});
  const [essayAnswers, setEssayAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [studentExamId, setStudentExamId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [serverLastQuestionFlag, setServerLastQuestionFlag] = useState(false); // Add state for server's last question flag
  
  // Get the studentExamId and first question from localStorage on mount
  useEffect(() => {
    const storedStudentExamId = localStorage.getItem('currentStudentExamId');
    const storedExamSession = localStorage.getItem('examSession');
    
    if (storedStudentExamId) {
      console.log('Retrieved student exam ID from localStorage:', storedStudentExamId);
      setStudentExamId(storedStudentExamId);
      
      // Initialize serverLastQuestionFlag as false for new sessions
      setServerLastQuestionFlag(false);
      
      // Fetch the exam information to get the total questions count
      const fetchExamInfo = async () => {
        try {
          const result = await studentExamService.getStudentExamResult(storedStudentExamId);
          console.log('Exam info result:', result.data);
          
          if (result && result.data && result.data.studentExam && result.data.studentExam.exam) {
            const examData = result.data.studentExam.exam;
            if (examData.questions && Array.isArray(examData.questions)) {
              console.log(`Setting total questions count: ${examData.questions.length}`);
              setTotalQuestions(examData.questions.length);
              
              // Also store in localStorage for persistence across page refreshes
              localStorage.setItem(`exam_total_questions_${storedStudentExamId}`, examData.questions.length);
            }
          }
        } catch (err) {
          console.warn('Could not fetch exam info for total questions count:', err);
          // Try to get from localStorage if previously stored
          const storedTotalQuestions = localStorage.getItem(`exam_total_questions_${storedStudentExamId}`);
          if (storedTotalQuestions) {
            setTotalQuestions(parseInt(storedTotalQuestions, 10));
          } else {
            // If we can't get the total, try to set a reasonable default
            setTotalQuestions(5); // Default to 5 questions if we can't get the actual count
          }
        }
      };
      
      // Always try to fetch exam info to get accurate question count
      fetchExamInfo();
      
      // Check if we have stored exam session data with the first question
      if (storedExamSession) {
        try {
          const sessionData = JSON.parse(storedExamSession);
          console.log('Retrieved exam session data:', sessionData);
          
          // If we have a question in the session data, use it as our first question
          if (sessionData.currentQuestion) {
            console.log('Found first question in session data:', sessionData.currentQuestion);
            
            const firstQuestion = {
              id: sessionData.currentQuestion.id,
              text: sessionData.currentQuestion.title,
              type: sessionData.currentQuestion.type,
              options: sessionData.currentQuestion.choices?.map(choice => {
                // Handle different possible formats of choices
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
            
            setQuestions([firstQuestion]);
            
            // Also check if this is the last question
            if (sessionData.lastQuestion === true) {
              setServerLastQuestionFlag(true);
            }
            
            setLoading(false);
            
            // Set initial time from session data if available
            const examDuration = sessionData.studentExam?.time || 60;  // default 60 minutes
            setTimeRemaining(examDuration * 60); // convert to seconds
          } else {
            // No current question in session data
            // This could be a session that was resumed from an in-progress exam
            // We need to get the next question from the backend
            const fetchFirstQuestion = async () => {
              try {
                // Use a dummy submission to get the next question
                const dummyResponse = await studentExamService.submitAnswer(storedStudentExamId, 0, "");
                
                // If we get a response with a next question
                if (dummyResponse && dummyResponse.data) {
                  console.log('Dummy submission response:', dummyResponse.data);
                  
                  // Check if this is the last question
                  setServerLastQuestionFlag(dummyResponse.data.lastQuestion === true);
                  
                  if (dummyResponse.data.nextQuestion) {
                    const nextQuestion = dummyResponse.data.nextQuestion;
                    console.log('Retrieved next question from API:', nextQuestion);
                    
                    const mappedQuestion = {
                      id: nextQuestion.id,
                      text: nextQuestion.title,
                      type: nextQuestion.type,
                      options: nextQuestion.choices?.map(choice => {
                        // Handle different possible formats of choices
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
                    
                    setQuestions([mappedQuestion]);
                  } else if (dummyResponse.data.lastQuestion) {
                    // No next question, but it is the last question (we've already answered all questions)
                    setError('You have already answered all questions. Please submit your exam.');
                  }
                  
                  // Set default exam duration (60 minutes) if not available
                  setTimeRemaining(60 * 60);
                } else {
                  setError('Could not retrieve exam question. Please try starting the exam again.');
                }
              } catch (err) {
                console.error('Error fetching first question:', err);
                setError('Error loading exam questions. Please try starting the exam again.');
              } finally {
                setLoading(false);
              }
            };
            
            fetchFirstQuestion();
          }
        } catch (err) {
          console.error('Error parsing stored exam session:', err);
          setError('Error loading exam session');
          setLoading(false);
        }
      } else {
        // We have a student exam ID but no session data
        // This could be a resumed session, so let's try to get the current question
        const fetchExamSession = async () => {
          try {
            // Try to get the current question by submitting a dummy answer
            const dummyResponse = await studentExamService.submitAnswer(storedStudentExamId, 0, "");
            
            if (dummyResponse && dummyResponse.data) {
              console.log('Resumed exam session response:', dummyResponse.data);
              
              // Check if this is the last question
              setServerLastQuestionFlag(dummyResponse.data.lastQuestion === true);
              
              if (dummyResponse.data.nextQuestion) {
                const nextQuestion = dummyResponse.data.nextQuestion;
                
                const mappedQuestion = {
                  id: nextQuestion.id,
                  text: nextQuestion.title,
                  type: nextQuestion.type,
                  options: nextQuestion.choices?.map(choice => {
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
                
                setQuestions([mappedQuestion]);
                setTimeRemaining(60 * 60); // Default to 60 minutes
              } else if (dummyResponse.data.lastQuestion) {
                // No next question, but it is the last question (we've already answered all questions)
                setError('You have already answered all questions. Please submit your exam.');
              }

              setLoading(false);
            } else {
              setError('Could not retrieve exam question. Please try starting the exam again.');
              setLoading(false);
            }
          } catch (err) {
            console.error('Error retrieving exam session:', err);
            setError('Error loading exam session. Please try starting the exam again.');
            setLoading(false);
          }
        };
        
        fetchExamSession();
      }
    } else {
      setError('No active exam session found. Please start the exam again.');
      setLoading(false);
    }
  }, []);
  
  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || loading) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmitExam();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, loading]);
  
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

  // Handle single choice selection
  const handleSingleChoiceSelect = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };
  
  // Handle multiple choice selection
  const handleMultipleChoiceSelect = (questionId, optionId) => {
    const currentSelections = multipleChoiceAnswers[questionId] || [];
    let updatedSelections;
    
    if (currentSelections.includes(optionId)) {
      // Remove the option if already selected
      updatedSelections = currentSelections.filter(id => id !== optionId);
    } else {
      // Add the option if not already selected
      updatedSelections = [...currentSelections, optionId];
    }
    
    setMultipleChoiceAnswers({
      ...multipleChoiceAnswers,
      [questionId]: updatedSelections
    });
  };
  
  // Handle essay input
  const handleEssayChange = (questionId, text) => {
    setEssayAnswers({
      ...essayAnswers,
      [questionId]: text
    });
  };
  
  // Submit multiple choice answers
  const submitMultipleChoiceAnswer = (questionId) => {
    const selections = multipleChoiceAnswers[questionId] || [];
    if (selections.length === 0) {
      alert('Please select at least one answer');
      return;
    }
    
    // Join the selected option IDs with commas for the API
    const answer = selections.join(',');
    submitAnswer(questionId, answer);
  };
  
  // Submit essay answer
  const submitEssayAnswer = (questionId) => {
    const text = essayAnswers[questionId] || '';
    if (!text.trim()) {
      alert('Please write your answer');
      return;
    }
    
    submitAnswer(questionId, text);
  };
  
  // Submit answer to the API
  const submitAnswer = async (questionId, answer) => {
    if (loading) return; // Prevent multiple submissions
    setLoading(true);
    
    try {
      console.log(`Submitting answer for question ${questionId}, answer: ${answer}, exam ${studentExamId}`);
      const response = await studentExamService.submitAnswer(studentExamId, questionId, answer);
      console.log('Answer submitted successfully', response.data);
      
      // The response contains the next question or indicates it's the last one
      if (response && response.data) {
        const responseData = response.data;
        console.log('SubmitAnswer response:', responseData);
        
        // Explicitly log the lastQuestion flag for debugging
        console.log('Server response lastQuestion flag:', responseData.lastQuestion);
        
        // Update our last question flag from server response
        if (responseData.lastQuestion === true) {
          console.log('Server indicates this is the last question');
          setServerLastQuestionFlag(true);
        } else {
          console.log('Server indicates this is NOT the last question');
          setServerLastQuestionFlag(false);
        }
        
        // Try to get total questions count if not already set
        if (totalQuestions === 0 && responseData.studentExam && 
            responseData.studentExam.exam && responseData.studentExam.exam.questions) {
          const questionsArray = responseData.studentExam.exam.questions;
          if (Array.isArray(questionsArray)) {
            const count = questionsArray.length;
            console.log(`Setting total questions count: ${count}`);
            setTotalQuestions(count);
            
            // Also store in localStorage for persistence
            localStorage.setItem(`exam_total_questions_${studentExamId}`, count);
          }
        }
        
        // If there's a next question in the response, add it to our list and navigate to it
        if (responseData.nextQuestion && responseData.nextQuestion.id) {
          // Check if we already have this question to prevent duplicates
          const questionExists = questions.some(q => q.id === responseData.nextQuestion.id);
          
          if (!questionExists) {
            const nextQuestion = {
              id: responseData.nextQuestion.id,
              text: responseData.nextQuestion.title,
              type: responseData.nextQuestion.type,
              options: responseData.nextQuestion.choices?.map(choice => {
                // Handle different possible formats of choices
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
            
            // Add the next question to our list
            setQuestions(prev => [...prev, nextQuestion]);
            
            // Automatically advance to the next question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          } else {
            console.warn('Question already exists, not adding duplicate:', responseData.nextQuestion.id);
          }
        } else if (responseData.lastQuestion) {
          // No next question but lastQuestion is true - this means we're on the last question
          console.log('No next question, and server confirms this is the last question');
        } else {
          console.warn('No next question and lastQuestion is not true - unexpected state');
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitExam = async () => {
    if (!studentExamId) {
      setError('No active exam session found');
      return;
    }
    
    if (window.confirm('Are you sure you want to submit the quiz? You cannot change your answers after submission.')) {
      try {
        setLoading(true);
        // Submit the exam and get the result
        const response = await studentExamService.submitExam(studentExamId);
        console.log('Exam submitted successfully:', response.data);
        
        if (response.data) {
          // Store the exam result
          const result = {
            correctAnswers: response.data.correctAnswers,
            wrongAnswers: response.data.wrongAnswers,
            totalQuestions: response.data.totalQuestions,
            score: response.data.score,
            duration: response.data.duration
          };
          
          setExamResult(result);
          setShowResults(true);
          
          // Clear the current exam session from localStorage
          localStorage.removeItem('currentStudentExamId');
          localStorage.removeItem('examSession');
        } else {
          setError('Received invalid response from server');
        }
      } catch (err) {
        console.error('Error submitting exam:', err);
        setError('Failed to submit exam. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Add an event handler to save the exam if the user navigates away
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (studentExamId && !showResults) {
        // Submit the exam automatically
        try {
          // Use synchronous method for beforeunload event
          const syncRequest = new XMLHttpRequest();
          const url = `http://localhost:8080/api/v1/student-exams/submit?studentExamId=${encodeURIComponent(studentExamId)}`;
          
          // Get auth headers
          let authToken = localStorage.getItem('token');
          
          syncRequest.open('POST', url, false); // false makes it synchronous
          if (authToken) {
            syncRequest.setRequestHeader('Authorization', `Bearer ${authToken}`);
          }
          syncRequest.setRequestHeader('Content-Type', 'application/json');
          syncRequest.send();
          
          // Also update local storage to mark this exam as completed
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
      
      // Modern browsers require setting a return value to show confirmation dialog
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

  // Get user's initial for avatar
  const getUserInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'S';
  };
  
  // Get user's full name or username
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

  // Results screen component
  const ExamResultsScreen = () => {
    if (!examResult) return null;
    
    return (
      <ResultContainer>
        <h2>Quiz Completed</h2>
        
        <ScoreDisplay>
          {Math.round(examResult.score)}%
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
        
        <BackButton onClick={() => navigate('/exams')}>
          Back to Exams
        </BackButton>
      </ResultContainer>
    );
  };
  
  // Show loading screen
  if (loading) {
    return (
      <LoadingContainer>
        Loading quiz...
      </LoadingContainer>
    );
  }
  
  // Show error screen
  if (error) {
    return (
      <ErrorContainer>
        <h2>Error</h2>
        <p>{error}</p>
        <BackButton onClick={() => navigate('/exams')}>
          Back to Exams
        </BackButton>
      </ErrorContainer>
    );
  }
  
  // Show results screen
  if (showResults) {
    return <ExamResultsScreen />;
  }
  
  // No questions loaded
  if (questions.length === 0) {
    return (
      <ErrorContainer>
        <h2>No Questions Available</h2>
        <p>There was an issue loading the questions for this quiz.</p>
        <BackButton onClick={() => navigate('/exams')}>
          Back to Exams
        </BackButton>
      </ErrorContainer>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  // Define isLastQuestion based on only the server flag
  const isLastQuestion = serverLastQuestionFlag;
  const timeRunningOut = timeRemaining !== null && timeRemaining < 300; // Less than 5 minutes
  
  // Render different question types
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;
    
    switch (currentQuestion.type) {
      case 'ESSAY':
        return (
          <div>
            <EssayInput
              value={essayAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleEssayChange(currentQuestion.id, e.target.value)}
              placeholder="Write your answer here..."
            />
            <NavigationBar>
              <SubmitButton onClick={() => submitEssayAnswer(currentQuestion.id)}>
                {serverLastQuestionFlag ? 'Submit' : 'Next'}
              </SubmitButton>
            </NavigationBar>
          </div>
        );
        
      case 'MULTIPLE_CHOICE':
        return (
          <>
            <AnswerOptions>
              {currentQuestion.options.map(option => (
                <AnswerOption 
                  key={option.id}
                  selected={(multipleChoiceAnswers[currentQuestion.id] || []).includes(option.id)}
                >
                  <CheckboxInput 
                    type="checkbox"
                    name={`question-${currentQuestion.id}-option-${option.id}`}
                    checked={(multipleChoiceAnswers[currentQuestion.id] || []).includes(option.id)}
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
              <SubmitButton onClick={() => submitMultipleChoiceAnswer(currentQuestion.id)}>
                {serverLastQuestionFlag ? 'Submit' : 'Next'}
              </SubmitButton>
            </NavigationBar>
          </>
        );
        
      case 'SINGLE_CHOICE':
      default:
        return (
          <>
            <AnswerOptions>
              {currentQuestion.options.map(option => (
                <AnswerOption 
                  key={option.id}
                  selected={answers[currentQuestion.id] === option.id}
                  onClick={() => handleSingleChoiceSelect(currentQuestion.id, option.id)}
                >
                  <RadioInput 
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === option.id}
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
              <SubmitButton onClick={() => submitSingleChoiceAnswer(currentQuestion.id)}>
                {serverLastQuestionFlag ? 'Submit' : 'Next'}
              </SubmitButton>
            </NavigationBar>
          </>
        );
    }
  };
  
  // Submit single choice answers - modified to handle last question correctly
  const submitSingleChoiceAnswer = (questionId) => {
    const selectedOption = answers[questionId];
    if (!selectedOption) {
      alert('Please select an answer');
      return;
    }
    
    submitAnswer(questionId, selectedOption);
  };
  
  return (
    <PageContainer>
      <Header>
        <SearchContainer>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput placeholder="Search..." />
        </SearchContainer>
        
        <ActionButtons>
          <SubmitQuizButton onClick={handleSubmitExam}>
            Submit Quiz
          </SubmitQuizButton>
          <UserProfile>
            <UserAvatar>{getUserInitial()}</UserAvatar>
            {getUserName()}
          </UserProfile>
        </ActionButtons>
      </Header>
      
      <MainContent>
        <QuizHeader>
          <QuizTitle>Quiz</QuizTitle>
          <TimerDisplay timeRunningOut={timeRunningOut}>
            Timer: {formatTime(timeRemaining)}
          </TimerDisplay>
        </QuizHeader>
        
        <QuizContent>
          <QuestionInfo>
            Question {currentQuestionIndex + 1}/{totalQuestions > 0 ? totalQuestions : "5"}
          </QuestionInfo>
          
          <Instructions>
            Answer the question below
          </Instructions>
          
          <QuestionContent>
            <QuestionImage>
              {/* This is a placeholder - in a real app, you'd use the question's actual image */}
              <img src="https://placehold.co/220x280/e74c3c/ffffff" alt="Quiz question illustration" />
            </QuestionImage>
            
            <div>
              <QuestionText>
                {currentQuestion.text}
              </QuestionText>
              
              {renderQuestionInput()}
            </div>
          </QuestionContent>
        </QuizContent>
      </MainContent>
    </PageContainer>
  );
}

export default TakeExamPage; 