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
  background-color: var(--bg-primary);
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
  color: var(--text-primary);
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
  color: ${props => props.timeRunningOut ? '#d32f2f' : '#333'};
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  const { theme } = useTheme();
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
  const [resumingExam, setResumingExam] = useState(false);
  const [timeExpirationChecked, setTimeExpirationChecked] = useState(false);
  // Thêm state cho modal xác nhận nộp bài
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  
  // Get the studentExamId and first question from localStorage on mount
  useEffect(() => {
    const storedStudentExamId = localStorage.getItem('currentStudentExamId');
    
    if (storedStudentExamId) {
      console.log('Retrieved student exam ID from localStorage:', storedStudentExamId);
      setStudentExamId(storedStudentExamId);
      
      // Initialize serverLastQuestionFlag as false for new sessions
      setServerLastQuestionFlag(false);
      
      // Try to resume the exam directly without status checks
      const resumeExam = async () => {
        try {
          setResumingExam(true);
          setLoading(true);
          
          // Extract examId from studentExamId to ensure we're using the correct format
          const actualExamId = examId || storedStudentExamId.split('-')[1];
          console.log('Actual exam ID for password retrieval:', actualExamId);
          
          try {
            console.log('Retrieving password from backend API...');
            // Get password from backend
            const password = await examService.getExamPassword(actualExamId);
            console.log('Password retrieved successfully from backend');
            
            if (password) {
              try {
                console.log(`Attempting to resume exam ${examId} with retrieved password`);
                // Call the start API with the password from backend - backend handles all state checks
                const startResponse = await studentExamService.startExam(examId, password);
                
                // Process the response data for resuming
                if (startResponse && startResponse.data) {
                  const responseData = startResponse.data;
                  console.log('API response data:', responseData);
                  
                  // Extract all needed data from the response
                  const isLastQuestion = responseData.lastQuestion === true;
                  setServerLastQuestionFlag(isLastQuestion);
                  
                  // Set total questions count if available
                  if (responseData.studentExam?.exam?.questions?.length) {
                    const totalQuestionsCount = responseData.studentExam.exam.questions.length;
                    setTotalQuestions(totalQuestionsCount);
                    console.log(`Total questions count: ${totalQuestionsCount}`);
                  }
                  
                  // Set current question index if available
                  if (responseData.studentExam?.currentQuestion !== undefined) {
                    const currentIndex = responseData.studentExam.currentQuestion;
                    setCurrentQuestionIndex(currentIndex);
                    console.log(`Current question index: ${currentIndex}`);
                  }
                  
                  // Set time remaining if available
                  if (responseData.minuteRemaining !== undefined && responseData.minuteRemaining !== null) {
                    const remainingTimeSeconds = responseData.minuteRemaining * 60;
                    setTimeRemaining(remainingTimeSeconds);
                    setTimeExpirationChecked(true);
                    console.log(`Time remaining: ${responseData.minuteRemaining} minutes (${remainingTimeSeconds} seconds)`);
                  }
                  
                  // Ensure we have all available questions 
                  const allQuestions = [];
                  
                  // If the API response contains the exam's questions array, use it to initialize
                  if (responseData.studentExam?.exam?.questions && Array.isArray(responseData.studentExam.exam.questions)) {
                    console.log('All questions from API:', responseData.studentExam.exam.questions);
                    
                    // Process and add all questions to our local state
                    responseData.studentExam.exam.questions.forEach((q, index) => {
                      const questionData = {
                        id: q.id,
                        text: q.title || q.text,
                        type: q.type,
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
                  
                  // Then ensure the nextQuestion from API is properly processed
                  if (responseData.nextQuestion) {
                    const questionData = responseData.nextQuestion;
                    console.log('Current question data from API:', questionData);
                    
                    // Map the question data to our format
                    const mappedQuestion = {
                      id: questionData.id,
                      text: questionData.title,
                      type: questionData.type,
                      options: questionData.choices?.map(choice => {
                        // Handle different possible choice formats
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
                    
                    console.log('Processed question:', mappedQuestion);
                    
                    // Kiểm tra xem nextQuestion đã có trong allQuestions chưa
                    // Nếu chưa có, thêm vào allQuestions
                    const existingIndex = allQuestions.findIndex(q => q.id === mappedQuestion.id);
                    if (existingIndex === -1) {
                      allQuestions.push(mappedQuestion);
                      console.log(`Added nextQuestion with ID ${mappedQuestion.id} to questions array`);
                    } else {
                      // Nếu đã có, cập nhật thông tin mới nhất từ API
                      allQuestions[existingIndex] = mappedQuestion;
                      console.log(`Updated existing question with ID ${mappedQuestion.id}`);
                    }
                    
                    // Sử dụng tất cả các câu hỏi đã thu thập
                    setQuestions(allQuestions);
                    
                    // Đảm bảo currentQuestionIndex được cập nhật để khớp với câu hỏi hiện tại từ API
                    if (responseData.studentExam?.currentQuestion !== undefined) {
                      // Nếu API trả về một currentQuestion cụ thể, nhưng câu hỏi hiện tại
                      // không khớp với những gì chúng ta mong đợi, điều chỉnh lại
                      const expectedCurrentQID = responseData.studentExam?.exam?.questions?.[responseData.studentExam.currentQuestion]?.id;
                      const actualCurrentQID = responseData.nextQuestion?.id;
                      
                      if (expectedCurrentQID && actualCurrentQID && expectedCurrentQID !== actualCurrentQID) {
                        console.warn(`Current question index mismatch detected!`);
                        console.warn(`Expected question ID at index ${responseData.studentExam.currentQuestion}: ${expectedCurrentQID}`);
                        console.warn(`Actual next question ID from API: ${actualCurrentQID}`);
                        
                        // Tìm index thực tế của câu hỏi trong mảng questions của chúng ta
                        const actualIndex = allQuestions.findIndex(q => q.id === actualCurrentQID);
                        if (actualIndex !== -1) {
                          console.log(`Adjusting currentQuestionIndex from ${responseData.studentExam.currentQuestion} to ${actualIndex}`);
                          setCurrentQuestionIndex(actualIndex);
                        }
                      }
                    }
                    
                    setLoading(false);
                  } else if (isLastQuestion) {
                    // If there's no next question and it's the last question,
                    // show a message to submit the exam
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
      
      // Helper function to handle any errors in the resume process
      const handleResumeError = (err) => {
        console.error('Resume error details:', err.response?.data || err.message);
        
        // Handle specific error types
        if (err.completed) {
          setError('This exam has already been completed or the time has expired.');
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to resume exam. Please try starting again.');
        }
        
        setLoading(false);
      };
      
      // Start the resume process
      resumeExam();
    } else {
      setError('No active exam session found. Please start the exam again.');
      setLoading(false);
    }
  }, [examId]);
  
  // Timer effect for countdown and auto-submit
  useEffect(() => {
    if (timeRemaining === null || loading || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmitExam();
          return 0;
        }
        
        // Save current time remaining every 30 seconds
        if (prevTime % 30 === 0 && studentExamId) {
          localStorage.setItem(`exam_time_remaining_${studentExamId}`, prevTime.toString());
          localStorage.setItem(`exam_time_last_updated_${studentExamId}`, Date.now().toString());
        }
        
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, loading, studentExamId]);
  
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
    // Kiểm tra questionId và optionId tồn tại
    if (!questionId || !optionId) return;
    
    // Tìm câu hỏi hiện tại
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    // Tìm lựa chọn được chọn để lấy nội dung thực tế
    const selectedOption = currentQuestion.options?.find(opt => opt.id === optionId);
    if (!selectedOption) return;
    
    // Lưu cả ID và text của lựa chọn
    setAnswers({
      ...answers,
      [questionId]: {
        id: optionId,
        text: selectedOption.text || ''
      }
    });
  };
  
  // Handle multiple choice selection
  const handleMultipleChoiceSelect = (questionId, optionId) => {
    // Kiểm tra questionId và optionId tồn tại
    if (!questionId || !optionId) return;
    
    // Tìm câu hỏi hiện tại
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    const currentSelections = multipleChoiceAnswers[questionId] || [];
    let updatedSelections;
    
    // Kiểm tra xem optionId đã được chọn chưa
    if (currentSelections.some(item => item.id === optionId)) {
      // Xóa lựa chọn nếu đã được chọn
      updatedSelections = currentSelections.filter(item => item.id !== optionId);
    } else {
      // Thêm lựa chọn nếu chưa được chọn
      // Tìm lựa chọn để lấy nội dung text
      const selectedOption = currentQuestion.options?.find(opt => opt.id === optionId);
      if (!selectedOption) return;
      
      // Thêm cả ID và text
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
  
  // Handle essay input
  const handleEssayChange = (questionId, text) => {
    setEssayAnswers({
      ...essayAnswers,
      [questionId]: text
    });
  };
  
  // Submit single choice answers
  const submitSingleChoiceAnswer = (questionId) => {
    const selectedOption = answers[questionId];
    if (!selectedOption) {
      alert('Please select an answer');
      return;
    }
    
    console.log(`Submitting single choice answer - Question ${questionId}, Selected option:`, selectedOption);
    
    // Gửi nội dung câu trả lời thực tế thay vì chỉ ID
    const answerContent = selectedOption.text;
    
    // For the last question, we need to save the answer first, then submit the exam
    if (serverLastQuestionFlag) {
      // First save the answer to the server
      submitAnswer(questionId, answerContent, true);
    } else {
      // Not the last question - submit the answer and proceed to next
      submitAnswer(questionId, answerContent);
    }
  };
  
  // Submit multiple choice answers
  const submitMultipleChoiceAnswer = (questionId) => {
    const selections = multipleChoiceAnswers[questionId] || [];
    if (selections.length === 0) {
      alert('Please select at least one answer');
      return;
    }
    
    // Lấy danh sách nội dung câu trả lời
    const answerContents = selections.map(option => option.text);
    
    // Join các nội dung câu trả lời bằng dấu phẩy
    const answer = answerContents.join(', ');
    console.log(`Submitting multiple choice answer - Question ${questionId}, Selected options:`, answer);
    
    // For the last question, we need to save the answer first, then submit the exam
    if (serverLastQuestionFlag) {
      // First save the answer to the server
      submitAnswer(questionId, answer, true);
    } else {
      // Not the last question - submit the answer and proceed to next
      submitAnswer(questionId, answer);
    }
  };
  
  // Submit essay answer
  const submitEssayAnswer = (questionId) => {
    const text = essayAnswers[questionId] || '';
    if (!text.trim()) {
      alert('Please write your answer');
      return;
    }
    
    console.log(`Submitting essay answer - Question ${questionId}, Text length: ${text.length} chars`);
    
    // For the last question, we need to save the answer first, then submit the exam
    if (serverLastQuestionFlag) {
      // First save the answer to the server
      submitAnswer(questionId, text, true);
    } else {
      // Not the last question - submit the answer and proceed to next
      submitAnswer(questionId, text);
    }
  };
  
  // Submit answer to the API and move to next question if available
  const submitAnswer = async (questionId, answer, isLastQuestion = false) => {
    if (loading) return; // Prevent multiple submissions
    
    // Check if we're in the process of submitting the entire exam
    // If yes, don't submit this individual answer to prevent duplication
    if (localStorage.getItem(`exam_submitting_${studentExamId}`) === 'true') {
      console.log('Exam is being submitted, skipping individual answer submission');
      return;
    }
    
    setLoading(true);
    
    try {
      // Log rõ ràng các thông tin
      console.log(`--- SUBMITTING ANSWER DETAILS ---`);
      console.log(`Question ID: ${questionId}`);
      console.log(`Answer value: ${answer}`);
      console.log(`Student Exam ID: ${studentExamId}`);
      console.log(`Is Last Question: ${isLastQuestion}`);
      
      const response = await studentExamService.submitAnswer(studentExamId, questionId, answer);
      console.log('Answer submitted successfully', response.data);
      
      // The response contains the next question or indicates it's the last one
      if (response && response.data) {
        const responseData = response.data;
        
        // Get lastQuestion flag directly from API response - this is the ONLY source of truth
        const isLastQuestion = responseData.lastQuestion === true;
        console.log('Server response lastQuestion flag:', isLastQuestion);
        
        // Update our flag based ONLY on server response
        setServerLastQuestionFlag(isLastQuestion);
        
        // Set total questions if available from server response
        if (responseData.studentExam?.exam?.questions?.length) {
          const count = responseData.studentExam.exam.questions.length;
          console.log(`Setting total questions count: ${count}`);
          setTotalQuestions(count);
        }
        
        // Handle no next question case first
        if (!responseData.nextQuestion || !responseData.nextQuestion.id) {
          if (isLastQuestion) {
            console.log('No next question, and server confirms this is the last question');
          } else {
            console.warn('No next question but lastQuestion is false - unexpected state');
          }
          // We need to stop processing here since there's no next question to load
          setLoading(false);
          return;
        }
        
        // Process next question
        const nextQuestion = {
          id: responseData.nextQuestion.id,
          text: responseData.nextQuestion.title,
          type: responseData.nextQuestion.type,
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
        
        // Add the next question to our list 
        setQuestions(prev => [...prev, nextQuestion]);
        
        // Automatically advance to the next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
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
  
  const currentQuestion = questions.length > 0 
    ? (questions[currentQuestionIndex] || questions[0]) 
    : null;
  
  // SIMPLIFIED: Just use the server flag for last question detection
  // Based on backend logic, the server will set lastQuestion=true when reaching the last question
  const isLastQuestion = serverLastQuestionFlag;
  
  // console.log('Current question index:', currentQuestionIndex, 'Total questions:', totalQuestions, 'Is last question (from server):', isLastQuestion);
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
                <SubmitButton onClick={() => submitSingleChoiceAnswer(currentQuestion.id)}>
                  Next
                </SubmitButton>
              )}
            </NavigationBar>
          </>
        );
    }
  };
  
  // Cập nhật hàm handleSubmitExam
  const handleSubmitExam = () => {
    if (!studentExamId) {
      setError('No active exam session found');
      return;
    }
    
    // Hiển thị modal xác nhận thay vì dùng window.confirm
    setShowSubmitConfirmation(true);
  };
  
  // Thêm hàm xử lý khi người dùng xác nhận nộp bài
  const handleConfirmSubmit = async () => {
    try {
      setLoading(true);
      
      // Add a flag to track if we're about to submit the exam
      // This will be used to prevent duplicate saving of the last answer
      localStorage.setItem(`exam_submitting_${studentExamId}`, 'true');
      
      console.log('Submitting entire exam to server...', 'Current student exam ID:', studentExamId);
      // Submit the exam and get the result
      const response = await studentExamService.submitExam(studentExamId);
      console.log('Exam submitted successfully:', response.data);
      
      // Debug log - Chi tiết về data trả về
      console.log('Raw response data:', JSON.stringify(response.data, null, 2));
      
      // Kiểm tra cấu trúc response
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
        // Store the exam result
        const result = {
          correctAnswers: response.data.correctAnswers || 0,
          wrongAnswers: response.data.wrongAnswers || 0,
          totalQuestions: response.data.totalQuestions || 0,
          score: response.data.score || 0,
          duration: response.data.duration || 0
        };
        
        console.log('Final exam result being set:', result);
        
        setExamResult(result);
        setShowResults(true);
        
        // Clear the current exam session from localStorage
        localStorage.removeItem('currentStudentExamId');
        localStorage.removeItem('examSession');
        localStorage.removeItem(`exam_submitting_${studentExamId}`);
      } else {
        setError('Received invalid response from server');
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      
      // Remove the submitting flag when there's an error
      localStorage.removeItem(`exam_submitting_${studentExamId}`);
      
      // Chi tiết lỗi
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
  
  return (
    <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <Header>
        <SearchContainer>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput placeholder="Search..." />
        </SearchContainer>
        
        <ActionButtons>
          {/* <ThemeToggle /> */}
          <SubmitQuizButton onClick={handleSubmitExam}>
            Submit Quiz
          </SubmitQuizButton>
          <UserProfile>
            <span>{getUserName()}</span>
            <UserAvatar>{getUserInitial()}</UserAvatar>
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
        
        {/* Kiểm tra currentQuestion tồn tại trước khi cố render nội dung */}
        {currentQuestion ? (
          <QuizContent>
            <QuestionInfo>
              {serverLastQuestionFlag 
                ? `Question ${currentQuestionIndex + 1} (Last question)` 
                : `Question ${currentQuestionIndex + 1}`}
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
      
      {/* Thêm modal xác nhận nộp bài thi */}
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