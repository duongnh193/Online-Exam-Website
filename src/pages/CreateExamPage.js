import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import examService from '../services/examService';
import classService from '../services/classService';
import questionService from '../services/questionService';

// Styled Components
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Sidebar = styled.aside`
  width: 180px;
  background-color: #6a00ff;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 0 20px 20px 0;
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
  color: #333;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #444;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #6a00ff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #6a00ff;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #6a00ff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  background-color: ${props => props.variant === 'outline' ? 'transparent' : '#6a00ff'};
  color: ${props => props.variant === 'outline' ? '#6a00ff' : 'white'};
  border: ${props => props.variant === 'outline' ? '1px solid #6a00ff' : 'none'};
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.variant === 'outline' ? 'rgba(106, 0, 255, 0.05)' : '#5900d9'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3e3e;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  background-color: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

// For question management
const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
`;

const Tab = styled.div`
  padding: 0.75rem 1.5rem;
  color: ${props => props.active ? '#6a00ff' : '#666'};
  font-weight: ${props => props.active ? '600' : '500'};
  border-bottom: ${props => props.active ? '2px solid #6a00ff' : 'none'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #6a00ff;
  }
`;

const QuestionCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  border-left: 3px solid ${props => {
    switch(props.type) {
      case 'ESSAY': return '#f39c12';
      case 'MULTIPLE_CHOICE': return '#3498db';
      case 'SINGLE_CHOICE': return '#2ecc71';
      default: return '#ddd';
    }
  }};
`;

const ChoiceItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ChoiceLabel = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${props => props.isAnswer ? '#6a00ff' : '#f1f1f1'};
  color: ${props => props.isAnswer ? 'white' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-weight: 500;
  font-size: 0.9rem;
`;

const ChoiceText = styled.div`
  flex: 1;
`;

const FileUploadContainer = styled.div`
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #6a00ff;
    background-color: rgba(106, 0, 255, 0.02);
  }
`;

// Add a styled component for the image upload section
const ImageUploadContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const ImagePreview = styled.div`
  margin-top: 0.75rem;
  border: 1px dashed #ddd;
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
  display: ${props => props.hasImage ? 'block' : 'none'};
`;

const ImagePreviewImg = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
`;

const ImageActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
`;

const ImageIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f1f1;
  color: #333;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 14V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 3L12 15M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function CreateExamPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { examId } = useParams();
  const isEditMode = !!examId;
  
  // Redirect if not a lecturer or admin
  useEffect(() => {
    if (user && user.role !== 'ROLE_LECTURER' && user.role !== 'ROLE_ADMIN') {
      console.log('CreateExamPage: Unauthorized access attempt, user role:', user.role);
      navigate('/student-dashboard');
    }
  }, [user, navigate]);
  
  // State management
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [classes, setClasses] = useState([]);
  
  const [examData, setExamData] = useState({
    title: '',
    classId: '',
    duration: 60, // default 60 minutes
    startAt: '',
    endAt: '',
    status: 'SCHEDULED',
    password: '' // Add password field
  });
  
  const [createdExamId, setCreatedExamId] = useState(null);
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'import'
  const [questions, setQuestions] = useState([]);
  
  // For adding questions
  const [questionData, setQuestionData] = useState({
    title: '',
    type: 'SINGLE_CHOICE',
    choices: [
      { optionKey: 'A', optionValue: '' },
      { optionKey: 'B', optionValue: '' },
      { optionKey: 'C', optionValue: '' },
      { optionKey: 'D', optionValue: '' }
    ],
    answer: '',      // Will store actual answer text
    answerKeys: ''   // Will store option keys (A,B,C,D) for UI selection tracking
  });
  
  // For importing questions
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // Add state for image upload
  const [questionImage, setQuestionImage] = useState(null);
  const imageInputRef = useRef(null);
  
  // Add a new state for showing/hiding password
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Fetch exam data if in edit mode
  useEffect(() => {
    if (isEditMode && examId) {
      // Check if examId is valid (not 0 or null)
      if (examId === '0' || examId === 0) {
        console.log('Invalid exam ID (0). Skipping API call to prevent 409 error.');
        setError('Invalid exam ID. Please create a new exam instead.');
        return;
      }
      
      setLoading(true);
      console.log(`Fetching exam data for ID: ${examId}`);
      
      examService.getExamById(examId)
        .then(response => {
          const exam = response.data;
          console.log('Fetched exam data:', exam);
          
          // Convert dates to the format expected by datetime-local input
          const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
          };
          
          setExamData({
            title: exam.title || '',
            classId: exam.classId || '',
            duration: exam.duration || 60,
            startAt: formatDateForInput(exam.startAt),
            endAt: formatDateForInput(exam.endAt),
            status: exam.status || 'SCHEDULED',
            password: exam.password || ''
          });
          
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching exam for editing:', err);
          setError('Failed to load exam data. Please try again later.');
          setLoading(false);
        });
    }
  }, [isEditMode, examId]);
  
  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        let response;
        
        if (user && user.role === 'ROLE_LECTURER') {
          // Fetch classes for this lecturer
          response = await classService.getClassesByTeacher(user.id);
        } else if (user && user.role === 'ROLE_ADMIN') {
          // Admins can see all classes
          response = await classService.getAllClasses();
        }
        
        if (response && response.data) {
          const fetchedClasses = response.data.content || response.data;
          setClasses(fetchedClasses);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        // Fall back to mock data
        setClasses([
          { id: 1, name: 'Test Class 1' },
          { id: 2, name: 'Test Class 2' }
        ]);
      }
    };
    
    if (user) {
      fetchClasses();
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special validation for password
    if (name === 'password') {
      // Only validate if there's a value (password is optional)
      if (value && value.length > 0 && value.length < 4) {
        setPasswordError('Password must be at least 4 characters long');
      } else {
        setPasswordError('');
      }
    }
    
    setExamData(prev => ({ ...prev, [name]: value }));
  };
  
  // Fetch questions if we have an exam ID
  useEffect(() => {
    if ((createdExamId && createdExamId !== 0) || (isEditMode && examId && examId !== '0' && examId !== 0)) {
      const targetExamId = createdExamId || examId;
      fetchQuestions(targetExamId);
    }
  }, [createdExamId, examId, isEditMode]);
  
  const fetchQuestions = async (targetExamId) => {
    // Validate the target exam ID
    if (!targetExamId || targetExamId === 0 || targetExamId === '0') {
      console.warn('Invalid exam ID for fetching questions. Skipping API call.');
      return;
    }
    
    try {
      console.log(`Fetching questions for exam ID: ${targetExamId}`);
      setLoadingQuestions(true);
      const response = await questionService.getQuestionsByExam(targetExamId);
      
      // Check if response is valid
      if (response && response.data) {
        const questionData = response.data.content || response.data || [];
        console.log(`Successfully fetched ${questionData.length} questions`);
        setQuestions(questionData);
      } else {
        console.warn('Empty or invalid response from questions API');
        setQuestions([]);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      // Don't set an error message for the user since this is supplementary data
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate password if provided
    if (examData.password && examData.password.length > 0 && examData.password.length < 4) {
      setError('Exam password must be at least 4 characters long');
      setLoading(false);
      return;
    }
    
    try {
      // Convert string values to appropriate types
      const formattedData = {
        ...examData,
        classId: Number(examData.classId),
        duration: Number(examData.duration),
        // Include password (empty string is fine if not set)
        password: examData.password || ''
      };
      
      // Format dates to ISO strings if needed
      if (formattedData.startAt && !(formattedData.startAt instanceof Date)) {
        formattedData.startAt = new Date(formattedData.startAt).toISOString();
      }
      
      if (formattedData.endAt && !(formattedData.endAt instanceof Date)) {
        formattedData.endAt = new Date(formattedData.endAt).toISOString();
      }
      
      // Ensure status is one of the valid values
      if (!['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(formattedData.status)) {
        formattedData.status = 'SCHEDULED';
      }
      
      // Log the data being sent to the API
      console.log('Submitting exam data:', formattedData);
      
      let response;
      
      if (isEditMode) {
        // Update existing exam
        response = await examService.updateExam(examId, formattedData);
        console.log('Exam updated - Full response:', response);
        console.log('Exam updated - Data:', response.data);
        
        // Continue showing questions for the edited exam
        setCreatedExamId(examId);
        setShowQuestionManager(true);
      } else {
        // Create new exam
        response = await examService.createExam(formattedData);
        console.log('Exam created - Full response:', response);
        console.log('Exam created - Data:', response.data);
        
        // Verify that we have a valid ID in the response
        if (!response.data || !response.data.id) {
          console.error('No valid exam ID returned from API');
          setError('Failed to create exam: No valid ID returned from server');
          setLoading(false);
          return;
        }
        
        // Save the created exam ID and show question manager
        setCreatedExamId(response.data.id);
        setShowQuestionManager(true);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} exam:`, err);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} exam. Please check your inputs and try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestionData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleChoiceChange = (index, value) => {
    const updatedChoices = [...questionData.choices];
    updatedChoices[index].optionValue = value;
    setQuestionData(prev => ({ ...prev, choices: updatedChoices }));
  };
  
  const handleAnswerChange = (e, optionValue, optionKey) => {
    console.log('Single choice selected:', optionKey, optionValue);
    // For single choice questions, we need to store just the optionValue as the answer
    setQuestionData(prev => ({ 
      ...prev, 
      answer: optionValue,
      answerKeys: optionKey  // This will update the UI to show the selected radio button
    }));
  };
  
  const handleMultiAnswerChange = (option, optionValue) => {
    console.log('Multiple choice toggled:', option, optionValue);
    
    // Track which option keys are currently selected
    let selectedOptionKeys = questionData.answerKeys ? questionData.answerKeys.split(',') : [];
    
    // Check if this option is already selected
    if (selectedOptionKeys.includes(option)) {
      // Remove the option if already selected
      selectedOptionKeys = selectedOptionKeys.filter(a => a !== option);
    } else {
      // Add the option if not selected
      selectedOptionKeys.push(option);
    }
    
    // Sort the keys for consistent display
    selectedOptionKeys.sort();
    
    // Now map the selected option keys to their values
    const currentAnswerValues = selectedOptionKeys.map(key => {
      const choice = questionData.choices.find(c => c.optionKey === key);
      return choice ? choice.optionValue : '';
    }).filter(val => val); // Filter out empty values
    
    console.log('Updated selections:', selectedOptionKeys, currentAnswerValues);
    
    // Update the answer with the actual text values
    setQuestionData(prev => ({ 
      ...prev, 
      // Store both the option keys (for UI tracking) and the actual values
      answerKeys: selectedOptionKeys.join(','),
      answer: currentAnswerValues.join(',')
    }));
  };
  
  // Add image handling functions
  const handleImageSelect = () => {
    imageInputRef.current.click();
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestionImage({
          file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setQuestionImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  const handleAddQuestion = async () => {
    try {
      // Basic validation
      if (!questionData.title || questionData.title.trim() === '') {
        setError('Please enter a question title.');
        return;
      }

      // Validate that an answer is selected for choice-based questions
      if (questionData.type === 'SINGLE_CHOICE' && !questionData.answerKeys) {
        setError('Please select a correct answer for your single choice question.');
        return;
      }
      
      if (questionData.type === 'MULTIPLE_CHOICE' && (!questionData.answerKeys || questionData.answerKeys.trim() === '')) {
        setError('Please select at least one correct answer for your multiple choice question.');
        return;
      }
      
      const targetExamId = createdExamId || examId;
      console.log(`Adding question to exam ID: ${targetExamId}`);
      
      // Prepare data exactly as expected by the backend CreateQuestionRequest
      const data = {
        examId: Number(targetExamId),
        title: questionData.title.trim(),
        type: questionData.type,
        answer: "",
        image: null // Will be updated if we have an image
      };
      
      // Format choices based on question type
      if (data.type === 'ESSAY') {
        data.choices = [];
        data.answer = questionData.answer || ""; // Model answer for essay
      } else {
        // Ensure choices are properly formatted and not empty
        data.choices = questionData.choices
          .filter(choice => choice.optionValue.trim() !== '')
          .map(choice => ({
            optionKey: choice.optionKey,
            optionValue: choice.optionValue.trim()
          }));
          
        // Validate that we have choices
        if (data.choices.length < 2) {
          setError('Please provide at least two answer choices for a choice question.');
          return;
        }
        
        // Format answer based on question type
        if (data.type === 'SINGLE_CHOICE' && questionData.answerKeys) {
          // For single choice, find the selected choice and use its value
          const selectedChoice = questionData.choices.find(c => c.optionKey === questionData.answerKeys);
          if (selectedChoice) {
            data.answer = selectedChoice.optionValue;
          }
        } else if (data.type === 'MULTIPLE_CHOICE') {
          // For multiple choice, use the answer string already prepared (comma-separated)
          data.answer = questionData.answer || "";
        }
      }

      // Process image if provided
      if (questionImage && questionImage.file) {
        // For base64 encoding of image
        data.image = questionImage.preview;
      }
      
      // Debug logging
      console.log(`Question submission - Type: ${data.type}, Answer Keys: ${questionData.answerKeys}`);
      console.log('Formatted choices:', data.choices);
      console.log('Final answer value:', data.answer);
      
      try {
        const response = await questionService.createQuestion(data);
        console.log('Question created successfully:', response.data);
        
        // Show success message
        setSuccess('Question added successfully!');
        setError(null); // Clear any existing errors
        
        // Reset form and fetch updated questions
        setQuestionData({
          title: '',
          type: 'SINGLE_CHOICE',
          choices: [
            { optionKey: 'A', optionValue: '' },
            { optionKey: 'B', optionValue: '' },
            { optionKey: 'C', optionValue: '' },
            { optionKey: 'D', optionValue: '' }
          ],
          answer: '',
          answerKeys: ''
        });
        setQuestionImage(null); // Clear image
        
        fetchQuestions(targetExamId);
        
        // Clear success message after delay
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } catch (err) {
        console.error('Error adding question:', err);
        if (err.message) {
          setError(err.message);
        } else {
          setError('Failed to add question. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error in question form processing:', err);
      setError('An error occurred while processing the form. Please try again.');
    }
  };
  
  const handleFileSelect = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  
  const handleImportQuestions = async () => {
    if (!selectedFile) {
      setError('Please select a file to import.');
      return;
    }
    
    // Validate the file extension
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (fileExt !== 'csv') {
      setError('Please upload a CSV file.');
      return;
    }
    
    const targetExamId = createdExamId || examId;
    if (!targetExamId) {
      setError('No exam selected. Please create or select an exam first.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Importing CSV file "${selectedFile.name}" (${selectedFile.size} bytes) for exam ID: ${targetExamId}`);
      
      await questionService.importQuestionsFromCsv(selectedFile, targetExamId);
      
      // Success message
      setSuccess('Questions imported successfully!');
      
      // Reset file selection and fetch updated questions
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      fetchQuestions(targetExamId);
    } catch (err) {
      console.error('Error importing questions:', err);
      
      // Provide a user-friendly error message
      if (err.message && typeof err.message === 'string') {
        setError(err.message); // Use the error message from the service
      } else if (err.response?.status === 401) {
        setError('Authentication error. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to import questions to this exam.');
      } else if (err.response?.status === 500) {
        setError('Server error while importing questions. Please try again later.');
      } else {
        setError('Failed to import questions. Please check your file format and try again.');
      }
    } finally {
      setLoading(false);
      
      // Clear success message after a delay
      if (!error) {
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      }
    }
  };
  
  const handleFinish = () => {
    navigate('/exams', { 
      state: { 
        createdExamId: createdExamId || examId,
        classId: examData.classId,
        action: isEditMode ? 'edited' : 'created'
      } 
    });
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
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
  
  // Determine if user is lecturer or admin
  const isLecturer = user && user.role === 'ROLE_LECTURER';
  const isAdmin = user && user.role === 'ROLE_ADMIN';
  
  // Add confirmation before leaving if questions have been added
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (showQuestionManager && questions.length > 0) {
        // Standard confirm message for most browsers
        const message = "You have unsaved questions. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showQuestionManager, questions.length]);
  
  return (
    <PageContainer>
      <Sidebar>
        <Logo>logo</Logo>
        <SidebarMenu>
          {isLecturer ? (
            // Lecturer navigation
            <>
              <NavItem to="/lecturer-dashboard">
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams" className="active">
                <NavIcon>{getMenuIcon('exams')}</NavIcon>
                Exams
              </NavItem>
              <NavItem to="/class">
                <NavIcon>{getMenuIcon('class')}</NavIcon>
                Class
              </NavItem>
              <NavItem to="/reports">
                <NavIcon>{getMenuIcon('reports')}</NavIcon>
                Reports
              </NavItem>
            </>
          ) : (
            // Admin navigation
            <>
              <NavItem to="/admin-dashboard">
                <NavIcon>{getMenuIcon('dashboard')}</NavIcon>
                Dashboard
              </NavItem>
              <NavItem to="/exams" className="active">
                <NavIcon>{getMenuIcon('exams')}</NavIcon>
                Exams
              </NavItem>
              <NavItem to="/class">
                <NavIcon>{getMenuIcon('class')}</NavIcon>
                Class
              </NavItem>
              <NavItem to="/reports">
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
          )}
        </SidebarMenu>
        <BottomMenu>
          <NavItem to="/settings">
            <NavIcon>{getMenuIcon('settings')}</NavIcon>
            Settings
          </NavItem>
          <NavItem to="/" onClick={handleLogout}>
            <NavIcon>{getMenuIcon('signout')}</NavIcon>
            Sign out
          </NavItem>
        </BottomMenu>
      </Sidebar>
      
      <MainContent>
        <Header>
          <PageTitle>
            {showQuestionManager 
              ? 'Manage Questions' 
              : (isEditMode ? 'Edit Exam' : 'Create New Exam')}
          </PageTitle>
        </Header>
        
        {!showQuestionManager ? (
          <Card>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="title">Exam Title</Label>
                <Input 
                  id="title"
                  name="title"
                  value={examData.title}
                  onChange={handleChange}
                  placeholder="Enter exam title"
                  required
                />
              </FormGroup>
              
              <FormRow>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="classId">Class</Label>
                  <Select 
                    id="classId"
                    name="classId"
                    value={examData.classId}
                    onChange={handleChange}
                    required
                    disabled={isEditMode} // Cannot change class in edit mode
                  >
                    <option value="">Select a class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input 
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    value={examData.duration}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </FormRow>
              
              <FormRow>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="startAt">Start Date & Time</Label>
                  <Input 
                    id="startAt"
                    name="startAt"
                    type="datetime-local"
                    value={examData.startAt}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="endAt">End Date & Time</Label>
                  <Input 
                    id="endAt"
                    name="endAt"
                    type="datetime-local"
                    value={examData.endAt}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <Label htmlFor="status">Status</Label>
                <Select 
                  id="status"
                  name="status"
                  value={examData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="password">Exam Password (Optional)</Label>
                <div style={{ position: 'relative' }}>
                  <Input 
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={examData.password}
                    onChange={handleChange}
                    placeholder="Leave blank for no password protection"
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {passwordError && (
                  <div style={{ color: '#ff3e3e', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    {passwordError}
                  </div>
                )}
                {examData.password && !passwordError && (
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      height: '4px',
                      flex: 1,
                      backgroundColor: 
                        examData.password.length < 6 ? '#ffcccb' :
                        examData.password.length < 8 ? '#ffe066' : '#90ee90',
                      borderRadius: '2px'
                    }}></div>
                    <span style={{
                      fontSize: '0.8rem',
                      color: '#666'
                    }}>
                      {examData.password.length < 6 ? 'Weak' : 
                       examData.password.length < 8 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                  If set, students will need to enter this password to access the exam.
                </div>
              </FormGroup>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <ButtonGroup>
                <Button type="button" variant="outline" onClick={handleFinish}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Exam' : 'Create Exam')}
                </Button>
              </ButtonGroup>
            </form>
          </Card>
        ) : (
          <>
            <Card style={{ marginBottom: '2rem' }}>
              <h2>Exam: {examData.title}</h2>
              
              {/* Add password info if a password is set */}
              {examData.password && (
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>Password Protected:</span> 
                    <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                      {showPassword ? examData.password : '••••••••'}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '0.9rem'
                    }}
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
              )}
              
              <p>Add questions to your exam by creating them individually or importing from a CSV file.</p>
              
              <TabContainer>
                <Tab 
                  active={activeTab === 'add' ? "true" : "false"} 
                  onClick={() => setActiveTab('add')}
                >
                  Add Question
                </Tab>
                <Tab 
                  active={activeTab === 'import' ? "true" : "false"} 
                  onClick={() => setActiveTab('import')}
                >
                  Import Questions
                </Tab>
                <Tab 
                  active={activeTab === 'view' ? "true" : "false"} 
                  onClick={() => setActiveTab('view')}
                >
                  View Questions ({questions.length})
                </Tab>
              </TabContainer>
              
              {/* Display error message if there is one */}
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              {/* Display success message if there is one */}
              {success && <SuccessMessage>{success}</SuccessMessage>}
              
              {/* Add New Question Form */}
              {activeTab === 'add' && (
                <>
                  <FormGroup>
                    <Label htmlFor="title">Question Text</Label>
                    <Textarea 
                      id="title"
                      name="title"
                      value={questionData.title}
                      onChange={handleQuestionChange}
                      placeholder="Enter your question"
                      required
                    />
                  </FormGroup>
                  
                  {/* Add the image upload section */}
                  <ImageUploadContainer>
                    <Label>Question Image (optional)</Label>
                    <ButtonGroup style={{ marginTop: '0.5rem', justifyContent: 'flex-start' }}>
                      <Button 
                        type="button" 
                        variant="outline" 
                        style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={handleImageSelect}
                      >
                        <UploadIcon /> Upload Image
                      </Button>
                    </ButtonGroup>
                    
                    <input 
                      type="file" 
                      ref={imageInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    
                    {/* Image Preview */}
                    <ImagePreview hasImage={!!questionImage}>
                      {questionImage && (
                        <>
                          <ImagePreviewImg src={questionImage.preview} alt="Question" />
                          <ImageActions>
                            <ImageIconButton onClick={handleRemoveImage} title="Remove image">
                              <TrashIcon />
                            </ImageIconButton>
                          </ImageActions>
                        </>
                      )}
                    </ImagePreview>
                  </ImageUploadContainer>
                  
                  <FormGroup>
                    <Label htmlFor="type">Question Type</Label>
                    <Select 
                      id="type"
                      name="type"
                      value={questionData.type}
                      onChange={handleQuestionChange}
                      required
                    >
                      <option value="ESSAY">Essay</option>
                      <option value="SINGLE_CHOICE">Single Choice</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    </Select>
                  </FormGroup>
                  
                  {questionData.type !== 'ESSAY' && (
                    <>
                      <Label>Answer Choices</Label>
                      {questionData.choices.map((choice, index) => (
                        <FormGroup key={choice.optionKey}>
                          <FormRow>
                            <div style={{ width: '40px', textAlign: 'center', paddingTop: '8px' }}>
                              {choice.optionKey}.
                            </div>
                            <div style={{ flex: 1 }}>
                              <Input 
                                value={choice.optionValue}
                                onChange={(e) => handleChoiceChange(index, e.target.value)}
                                placeholder={`Option ${choice.optionKey}`}
                                required
                              />
                            </div>
                            <div style={{ width: '80px', textAlign: 'center', paddingTop: '8px' }}>
                              {questionData.type === 'SINGLE_CHOICE' ? (
                                <input 
                                  type="radio" 
                                  name="answer" 
                                  value={choice.optionKey}
                                  checked={questionData.answerKeys === choice.optionKey}
                                  onChange={() => handleAnswerChange(null, choice.optionValue, choice.optionKey)}
                                />
                              ) : (
                                <input 
                                  type="checkbox" 
                                  checked={questionData.answerKeys?.split(',').includes(choice.optionKey) || false}
                                  onChange={() => handleMultiAnswerChange(choice.optionKey, choice.optionValue)}
                                />
                              )}
                            </div>
                          </FormRow>
                        </FormGroup>
                      ))}
                    </>
                  )}
                  
                  {questionData.type === 'ESSAY' && (
                    <FormGroup>
                      <Label htmlFor="answer">Model Answer (optional)</Label>
                      <Textarea 
                        id="answer"
                        name="answer"
                        value={questionData.answer}
                        onChange={handleQuestionChange}
                        placeholder="Enter a model answer (for grading reference)"
                      />
                    </FormGroup>
                  )}
                  
                  <ButtonGroup>
                    <Button type="button" onClick={handleAddQuestion}>
                      Add Question
                    </Button>
                  </ButtonGroup>
                </>
              )}
              
              {activeTab === 'import' && (
                <>
                  <p>Import questions from a CSV file. The file should have the following columns:</p>
                  <ul>
                    <li>title - The question text</li>
                    <li>type - ESSAY, SINGLE_CHOICE, or MULTIPLE_CHOICE</li>
                    <li>choiceA, choiceB, choiceC, choiceD - Answer choices (for multiple/single choice)</li>
                    <li>answer - Correct answer(s). For multiple choice, separate with commas</li>
                  </ul>
                  
                  <FileUploadContainer onClick={handleFileSelect}>
                    {selectedFile ? (
                      <p>Selected file: {selectedFile.name}</p>
                    ) : (
                      <>
                        <p>Click to select a CSV file</p>
                        <small>or drag and drop a file here</small>
                      </>
                    )}
                  </FileUploadContainer>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  
                  <ButtonGroup>
                    <Button 
                      type="button" 
                      onClick={handleImportQuestions}
                      disabled={!selectedFile}
                    >
                      Import Questions
                    </Button>
                  </ButtonGroup>
                </>
              )}
              
              {activeTab === 'view' && (
                <>
                  {loadingQuestions ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      Loading questions...
                    </div>
                  ) : questions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      No questions have been added yet.
                    </div>
                  ) : (
                    questions.map((question, index) => (
                      <QuestionCard key={question.id} type={question.type}>
                        <div style={{ fontWeight: 500, marginBottom: '0.75rem' }}>
                          {index + 1}. {question.title}
                        </div>
                        
                        {question.type !== 'ESSAY' && question.choices && (
                          <div style={{ marginLeft: '1.5rem' }}>
                            {question.choices.map(choice => {
                              // Check if this choice's value is part of the answer
                              // For single choice: exact match of the answer text
                              // For multiple choice: the answer text includes this choice value
                              const isAnswer = question.type === 'SINGLE_CHOICE'
                                ? question.answer === choice.optionValue
                                : question.answer && question.answer.split(',').some(ans => 
                                    ans.trim() === choice.optionValue.trim()
                                  );
                              
                              return (
                                <ChoiceItem key={choice.optionKey}>
                                  <ChoiceLabel isAnswer={isAnswer}>
                                    {choice.optionKey}
                                  </ChoiceLabel>
                                  <ChoiceText>{choice.optionValue}</ChoiceText>
                                </ChoiceItem>
                              );
                            })}
                          </div>
                        )}
                        
                        {question.type === 'ESSAY' && question.answer && (
                          <div style={{ 
                            marginLeft: '1.5rem', 
                            borderLeft: '2px solid #f39c12',
                            paddingLeft: '0.75rem',
                            fontStyle: 'italic'
                          }}>
                            Model answer: {question.answer}
                          </div>
                        )}
                      </QuestionCard>
                    ))
                  )}
                </>
              )}
            </Card>
            
            <ButtonGroup>
              <Button variant="outline" onClick={handleFinish}>
                Finish
              </Button>
            </ButtonGroup>
          </>
        )}
      </MainContent>
    </PageContainer>
  );
}

export default CreateExamPage; 