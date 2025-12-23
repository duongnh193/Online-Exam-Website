import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import statisticsService from '../../services/statisticsService';
import dashboardService from '../../services/dashboardService';
import assistantService from '../../services/assistantService';
import chatHistoryService from '../../services/chatHistoryService';
import ChatHistoryPanel from './ChatHistoryPanel';
import {
  usageGuides,
  studentStudyTips,
  lecturerQualityTips,
  fallbackMessages
} from '../../data/chatbotGuides';
import { searchKnowledgeBase, getKnowledgeEntries } from '../../data/chatbotKnowledgeBase';

const WidgetContainer = styled.section`
  margin-top: 1.5rem;
  flex: 1;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
  height: calc(100vh - 200px);
  max-height: calc(100vh - 200px);
`;

const ChatSurface = styled.div`
  flex: 1;
  background: var(--bg-secondary, #ffffff);
  border-radius: 16px;
  box-shadow: var(--card-shadow, 0 16px 40px rgba(80, 72, 229, 0.15));
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 0;
  overflow: hidden;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

const WidgetHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const IconButton = styled.button`
  background: var(--hover-bg, rgba(106, 0, 255, 0.08));
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--highlight-color, #6a00ff);
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: var(--hover-bg, rgba(106, 0, 255, 0.14));
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary, #1f1f1f);
  }

  span {
    font-size: 0.85rem;
    color: var(--text-secondary, #6f6f6f);
  }
`;

const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SuggestionChip = styled.button`
  border: none;
  background: var(--hover-bg, rgba(106, 0, 255, 0.08));
  color: var(--highlight-color, #6a00ff);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease, color 0.3s ease;

  &:hover {
    background: var(--hover-bg, rgba(106, 0, 255, 0.14));
    transform: translateY(-1px);
  }

  &:disabled {
    background: var(--hover-bg, rgba(106, 0, 255, 0.18));
    cursor: not-allowed;
    transform: none;
    opacity: 0.6;
  }
`;

const ConversationPane = styled.div`
  flex: 1;
  background: ${props => {
    // Light theme: light purple tint
    // Dark theme: slightly lighter than bg-secondary for contrast
    return 'var(--bg-primary, rgba(106, 0, 255, 0.05))';
  }};
  border-radius: 16px;
  padding: 1.25rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-height: 0;
  max-height: 100%;
  transition: background-color 0.3s ease;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(106, 0, 255, 0.3);
    border-radius: 10px;
    transition: background 0.2s ease;
    
    &:hover {
      background: rgba(106, 0, 255, 0.5);
    }
  }
`;

const Message = styled.div`
  align-self: ${({ role }) => (role === 'user' ? 'flex-end' : 'flex-start')};
  max-width: 80%;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
  text-align: left;
  background: ${({ role }) =>
    role === 'user' ? 'var(--highlight-color, #6a00ff)' : 'var(--bg-secondary, #ffffff)'};
  color: ${({ role }) => 
    role === 'user' 
      ? 'white' 
      : 'var(--text-primary, #333)'};
  box-shadow: ${({ role }) =>
    role === 'user'
      ? '0 6px 16px rgba(106, 0, 255, 0.25)'
      : 'var(--card-shadow, 0 4px 12px rgba(15, 23, 42, 0.08))'};
  white-space: pre-line;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const SourceBadge = styled.span`
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ role }) => (role === 'user' ? 'rgba(255, 255, 255, 0.78)' : '#6a00ff')};
`;

const InputRow = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
`;

const InputContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
  padding: 0.5rem 1rem;
  background: var(--input-bg, var(--bg-secondary, #ffffff));
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;

  &:focus-within {
    border-color: var(--highlight-color, #6a00ff);
    box-shadow: 0 0 0 3px rgba(106, 0, 255, 0.16);
  }
`;

const ChatInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 0.25rem 0;
  font-size: 0.9rem;
  background: transparent;
  color: var(--text-primary, #1f1f1f);
  transition: color 0.3s ease;

  &::placeholder {
    color: var(--text-secondary, #6f6f6f);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  border: none;
  background: transparent;
  color: var(--text-secondary, #6f6f6f);
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease, color 0.3s ease;

  &:hover {
    background: var(--hover-bg, rgba(106, 0, 255, 0.1));
    color: var(--highlight-color, #6a00ff);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  border-radius: 999px;
  border: none;
  background: #6a00ff;
  color: white;
  padding: 0.65rem 1.2rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.2s ease, transform 0.2s ease;
  min-width: 80px;

  &:hover:not(:disabled) {
    background: #5a00d4;
    transform: translateY(-1px);
  }

  &:disabled {
    background: rgba(106, 0, 255, 0.35);
    cursor: not-allowed;
    transform: none;
  }
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--hover-bg, rgba(106, 0, 255, 0.1));
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--highlight-color, #6a00ff);
  margin-bottom: 0.5rem;
  transition: background-color 0.3s ease, color 0.3s ease;
  
  button {
    background: none;
    border: none;
    color: var(--highlight-color, #6a00ff);
    cursor: pointer;
    padding: 0;
    margin-left: 0.5rem;
    font-size: 1rem;
    line-height: 1;
    transition: opacity 0.2s ease;
    
    &:hover {
      opacity: 0.7;
    }
  }
`;

const EmptyState = styled.div`
  color: rgba(15, 23, 42, 0.7);
  font-size: 0.9rem;
  text-align: center;
`;

const INTRO_MESSAGES = {
  student:
    'Hello! I can analyze your scores to suggest study directions and provide system usage guidance.',
  lecturer:
    'Hello lecturer! I help you overview classes, build exams, and create support plans for students.'
};

const SECONDARY_HINT =
  'Please select a suggestion button or type keywords like "Study suggestions", "Usage guide", "Class report".';

const SUGGESTIONS = {
  student: [
    { label: 'Study Suggestions', intent: 'learning' },
    { label: 'View Weak Scores', intent: 'learning_focus' },
    { label: 'Usage Guide', intent: 'guide' }
  ],
  lecturer: [
    { label: 'Class Overview', intent: 'lecturer_overview' },
    { label: 'Improve Exam Quality', intent: 'lecturer_quality' },
    { label: 'Usage Guide', intent: 'guide' }
  ],
  default: [
    { label: 'Usage Guide', intent: 'guide' },
    { label: 'Study Suggestions', intent: 'learning' }
  ]
};

const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const normalizeCount = (value) => {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return 0;
  if (typeof value === 'object') {
    if (typeof value.count === 'number') return value.count;
    if (typeof value.total === 'number') return value.total;
    if (typeof value.data === 'number') return value.data;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const detectIntent = (text, role) => {
  const lower = text.toLowerCase();
  if (
    lower.includes('guide') ||
    lower.includes('usage') ||
    lower.includes('how to') ||
    lower.includes('login') ||
    lower.includes('website') ||
    lower.includes('help')
  ) {
    return 'guide';
  }

  if (
    lower.includes('study') ||
    lower.includes('score') ||
    lower.includes('result') ||
    lower.includes('review') ||
    lower.includes('subject') ||
    lower.includes('achievement') ||
    lower.includes('grade')
  ) {
    return 'learning';
  }

  if (
    role === 'lecturer' &&
    (lower.includes('class') ||
      lower.includes('report') ||
      lower.includes('manage') ||
      lower.includes('quality') ||
      lower.includes('exam')))
   {
    return lower.includes('quality') ? 'lecturer_quality' : 'lecturer_overview';
  }

  return 'unknown';
};

const buildStudentAdvice = (data, focusLowOnly = false) => {
  const classResults = Array.isArray(data?.classResults) ? data.classResults : [];
  if (!classResults.length) {
    return fallbackMessages.missingScores;
  }

  const enrichClass = (item) => {
    const score =
      toNumber(item.averageScore) ||
      toNumber(item.averageScoreIn10) ||
      toNumber(item.averageScoreIn4) * 2.5;
    const label =
      item.className ||
      item.name ||
      item.classTitle ||
      (item.classId ? `Class ${item.classId}` : 'Unnamed Class');
    return {
      ...item,
      score10: Number(score.toFixed(2)),
      label
    };
  };

  const mapped = classResults.map(enrichClass);
  const sorted = [...mapped].sort((a, b) => a.score10 - b.score10);
  const weakest = sorted.slice(0, Math.min(2, sorted.length));
  const strongest = [...sorted].reverse().slice(0, Math.min(2, sorted.length));
  const lowSubjects = sorted.filter((item) => item.score10 < studentStudyTips.warningThreshold);

  const overall =
    sorted.reduce((sum, item) => sum + item.score10, 0) / (sorted.length || 1);

  const lines = [];
  lines.push(
    `Overview: Your current average score is approximately ${overall.toFixed(1)}/10 across ${sorted.length} classes with scores.`
  );

  if (!focusLowOnly && strongest.length) {
    const bestList = strongest
      .map((item) => `${item.label} (${item.score10.toFixed(1)})`)
      .join('; ');
    lines.push(`Strong subjects: ${bestList}. Keep up the good work and share your experience with classmates if possible.`);
  }

  if (lowSubjects.length) {
    const lowList = lowSubjects
      .map((item) => `${item.label} (${item.score10.toFixed(1)})`)
      .join('; ');
    lines.push(
      `Subjects to prioritize: ${lowList}. Try breaking down goals and schedule review sessions this week.`
    );
    lines.push(
      `To improve quickly: ${studentStudyTips.lowScoreAdvice.slice(0, 3).join('; ')}.`
    );
  } else if (weakest.length) {
    const weakList = weakest
      .map((item) => `${item.label} (${item.score10.toFixed(1)})`)
      .join('; ');
    lines.push(`Lowest scoring subjects: ${weakList}. You should review your notes and ask your lecturer early.`);
  }

  if (!focusLowOnly) {
    lines.push(`Suggested tips: ${studentStudyTips.defaultAdvice.join('; ')}.`);
  }

  return lines.join('\n');
};

const buildGuideResponse = (role) => {
  const sections = usageGuides[role] || usageGuides.student;
  const lines = ['Quick Guide:'];

  sections.forEach((section) => {
    lines.push(`${section.title}:`);
    section.steps.forEach((step, index) => {
      lines.push(`  ${index + 1}. ${step}`);
    });
  });

  const roleKey = role === 'lecturer' ? 'lecturer' : 'student';
  const faqEntries = getKnowledgeEntries()
    .filter((entry) => entry.tags?.includes('faq') && (entry.role === 'all' || entry.role === roleKey))
    .slice(0, 4);

  if (faqEntries.length) {
    lines.push('Frequently Asked Questions:');
    faqEntries.forEach((entry, index) => {
      lines.push(`  ${index + 1}. ${entry.question} -> ${entry.answer}`);
    });
  }

  return lines.join('\n');
};

const buildLecturerResponse = (stats, includeQuality = false) => {
  const { classCount, examCount } = stats;
  const lines = [];

  lines.push(
    `Overview: You are currently managing approximately ${classCount} classes and ${examCount} exams. Check the Reports section weekly to track scores.`
  );
  lines.push(
    'Use the Class tab to quickly notify students and update materials in the Resources or Files section.'
  );

  lines.push(`Quick action suggestions: ${lecturerQualityTips.quickWins.join('; ')}.`);

  if (includeQuality) {
    lines.push(
      `Improve question bank: ${lecturerQualityTips.questionBank.join('; ')}.`
    );
    lines.push(`Post-exam support plan: ${lecturerQualityTips.followUp.join('; ')}.`);
  }

  return lines.join('\n');
};

const formatConversationForModel = (conversationSnapshot = []) => {
  return conversationSnapshot
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
};

const callGenerativeModel = async (conversationSnapshot, roleLabel = 'student') => {
  try {
    const history = formatConversationForModel(conversationSnapshot).slice(-8);
    if (!history.length) {
      return {
        text: fallbackMessages.generic,
        source: 'Gemini (API)'
      };
    }

    const payload = {
      messages: history,
      metadata: {
        role: roleLabel
      }
    };

    const response = await assistantService.askAssistant(payload);
    const answer =
      response.data?.answer ||
      response.data?.message ||
      response.data?.content ||
      response.data?.response;

    if (answer) {
      return { text: answer, source: 'Gemini (API)' };
    }

    return {
      text: 'No response received from AI model. Please check backend configuration.',
      source: 'Gemini (API)'
    };
  } catch (error) {
    console.error('Failed to connect Gemini assistant:', error);
    let errorMessage = 'Unable to connect to AI model. Please try again later.';
    if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage = 'No valid API key configured for AI model.';
    }
    return {
      text: errorMessage,
      source: 'Gemini (API)'
    };
  }
};

const ChatbotWidget = ({ userRole = 'student', user = null }) => {
  const normalizedRole = userRole === 'lecturer' ? 'lecturer' : 'student';
  
  // Initialize conversation ID
  const [currentConversationId, setCurrentConversationId] = useState(() => {
    // Create new conversation ID initially, will be updated after loading from backend
    return chatHistoryService.generateConversationId();
  });

  const [messages, setMessages] = useState(() => {
    // Default intro messages, will be updated after loading from backend
    return [
      { role: 'assistant', text: INTRO_MESSAGES[normalizedRole], source: 'intro' },
      { role: 'assistant', text: SECONDARY_HINT, source: 'guide' }
    ];
  });

  // Load conversations from backend on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        // Sync from backend first
        await chatHistoryService.syncFromBackend();
        
        // Try to load current conversation ID from storage
        const savedId = chatHistoryService.getCurrentConversationId();
        if (savedId) {
          const conversation = await chatHistoryService.getConversation(savedId, true);
          if (conversation && conversation.messages.length > 0) {
            setCurrentConversationId(savedId);
            setMessages(conversation.messages);
            return;
          }
        }
        
        // If no saved conversation, check if there are any recent conversations
        const histories = await chatHistoryService.getAllHistories(true);
        if (histories && histories.length > 0) {
          // Load the most recent conversation
          const mostRecent = histories[0];
          setCurrentConversationId(mostRecent.id);
          chatHistoryService.setCurrentConversationId(mostRecent.id);
          setMessages(mostRecent.messages);
        }
      } catch (error) {
        console.warn('Failed to load conversations from backend, using localStorage:', error);
        // Fallback to localStorage
        const savedId = chatHistoryService.getCurrentConversationId();
        if (savedId) {
          const conversation = await chatHistoryService.getConversation(savedId, false);
          if (conversation && conversation.messages.length > 0) {
            setCurrentConversationId(savedId);
            setMessages(conversation.messages);
          }
        }
      }
    };

    loadConversations();
  }, []);
  
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const fileInputRef = useRef(null);
  const conversationEndRef = useRef(null);

  const activeSuggestions =
    SUGGESTIONS[normalizedRole] || SUGGESTIONS.default;

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-save conversation when messages change
  useEffect(() => {
    // Don't save intro messages only
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      chatHistoryService.saveConversation(currentConversationId, messages)
        .catch(error => {
          console.warn('Failed to save conversation:', error);
        });
      chatHistoryService.setCurrentConversationId(currentConversationId);
    }
  }, [messages, currentConversationId]);

  const appendAssistantMessage = (text, source = 'assistant') => {
    setMessages((prev) => [...prev, { role: 'assistant', text, source }]);
  };

const handleIntent = async (intent, conversationSnapshot) => {
  try {
    switch (intent) {
      case 'learning':
      case 'learning_focus': {
        if (normalizedRole === 'student') {
          if (!user?.id) {
            return {
              text: fallbackMessages.missingScores,
              source: 'Analytics'
            };
          }
          const response = await statisticsService.getStudentScoreByClasses(user.id);
          const advice = buildStudentAdvice(response?.data, intent === 'learning_focus');
          return { text: advice, source: 'Analytics' };
        }
        return {
          text: 'You can view student score reports in the Reports section and filter by class to send personalized feedback.',
          source: 'Guide'
        };
      }

      case 'guide':
        return { text: buildGuideResponse(normalizedRole), source: 'Guide' };

      case 'lecturer_overview':
      case 'lecturer_quality': {
        if (normalizedRole !== 'lecturer') {
          return { text: buildGuideResponse(normalizedRole), source: 'Guide' };
        }
        if (!user?.id) {
          return {
            text: 'Lecturer ID not found. Please logout and login again.',
            source: 'System'
          };
        }
        const [examRes, classRes] = await Promise.all([
          dashboardService.getExamCount(user.id),
          dashboardService.getClassCount(user.id)
        ]);
        const stats = {
          examCount: normalizeCount(examRes),
          classCount: normalizeCount(classRes)
        };
        return {
          text: buildLecturerResponse(
            stats,
            intent === 'lecturer_quality'
          ),
          source: 'Analytics'
        };
      }

      default:
        if (intent === 'unknown') {
          return callGenerativeModel(conversationSnapshot, normalizedRole);
        }
        return { text: fallbackMessages.generic, source: 'Assistant' };
    }
  } catch (error) {
    console.error('Chatbot intent error:', error);
    if (intent === 'learning' || intent === 'learning_focus') {
      return {
        text: 'Unable to retrieve score data. Please try again in a few minutes.',
        source: 'Analytics'
      };
    }
    return {
      text: 'I encountered an error processing this request. Please try again.',
      source: 'Assistant'
    };
  }
};

  const processUserMessage = async (text, forcedIntent) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', text: trimmed };
    const conversationSnapshot = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const knowledgeHit = searchKnowledgeBase(trimmed, normalizedRole);
      if (knowledgeHit) {
        const sourceLabel = knowledgeHit.tags?.includes('faq') ? 'FAQ' : 'Guide';
        appendAssistantMessage(knowledgeHit.answer, sourceLabel);
        return;
      }

      const intent = forcedIntent || detectIntent(trimmed, normalizedRole);
      const { text: replyText, source } = await handleIntent(
        intent,
        conversationSnapshot
      );
      appendAssistantMessage(replyText || fallbackMessages.generic, source || 'Assistant');
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestionClick = (option) => {
    if (isSending) return;
    processUserMessage(option.label, option.intent);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputValue.trim() || isSending) return;
    processUserMessage(inputValue);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Optionally, you can process the file immediately or wait for send
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendWithFile = async () => {
    if (!inputValue.trim() && !selectedFile) return;
    
    let messageText = inputValue.trim();
    if (selectedFile) {
      messageText = messageText 
        ? `${messageText} [Attached file: ${selectedFile.name}]`
        : `[Attached file: ${selectedFile.name}]`;
    }
    
    if (messageText) {
      await processUserMessage(messageText);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleNewChat = () => {
    const newConversationId = chatHistoryService.generateConversationId();
    setCurrentConversationId(newConversationId);
    chatHistoryService.setCurrentConversationId(newConversationId);
    setMessages([
      { role: 'assistant', text: INTRO_MESSAGES[normalizedRole], source: 'intro' },
      { role: 'assistant', text: SECONDARY_HINT, source: 'guide' }
    ]);
    setInputValue('');
    setSelectedFile(null);
  };

  const handleSelectConversation = async (conversationId) => {
    try {
      const conversation = await chatHistoryService.getConversation(conversationId, true);
      if (conversation) {
        setCurrentConversationId(conversationId);
        chatHistoryService.setCurrentConversationId(conversationId);
        setMessages(conversation.messages);
        setIsHistoryOpen(false);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // Fallback to localStorage
      const conversation = await chatHistoryService.getConversation(conversationId, false);
      if (conversation) {
        setCurrentConversationId(conversationId);
        chatHistoryService.setCurrentConversationId(conversationId);
        setMessages(conversation.messages);
        setIsHistoryOpen(false);
      }
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await chatHistoryService.deleteConversation(conversationId);
      if (conversationId === currentConversationId) {
        // If deleting current conversation, start a new one
        handleNewChat();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return (
    <>
      <ChatHistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      <WidgetContainer>
        <ChatSurface>
        <WidgetHeader>
          <Title>
            <h2>AI Assistant (beta)</h2>
            <span>
              Virtual assistant helping {normalizedRole === 'lecturer' ? 'lecturers manage classes and improve exam quality' : 'students orient study and get familiar with the system'}
            </span>
          </Title>
          <HeaderActions>
            <IconButton
              onClick={handleNewChat}
              title="New Chat"
              aria-label="Start new conversation"
            >
              <AddIcon style={{ fontSize: '1.25rem' }} />
            </IconButton>
            <IconButton
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title="Chat History"
              aria-label="Toggle chat history"
            >
              <HistoryIcon style={{ fontSize: '1.25rem' }} />
            </IconButton>
          </HeaderActions>
        </WidgetHeader>

        <Suggestions>
          {activeSuggestions.map((option) => (
            <SuggestionChip
              type="button"
              key={option.label}
              onClick={() => handleSuggestionClick(option)}
              disabled={isSending}
            >
              {option.label}
            </SuggestionChip>
          ))}
        </Suggestions>

        <ConversationPane>
          {messages.length === 0 ? (
            <EmptyState>Please ask a question to start the conversation.</EmptyState>
          ) : (
            <>
              {messages.map((message, idx) => (
                <Message role={message.role} key={`${message.role}-${idx}`}>
                  {message.text}
                  {message.role === 'assistant' && message.source && (
                    <SourceBadge role={message.role}>
                      {message.source.toUpperCase()}
                    </SourceBadge>
                  )}
                </Message>
              ))}
              <div ref={conversationEndRef} />
            </>
          )}
        </ConversationPane>

        {selectedFile && (
          <FilePreview>
            <AttachFileIcon style={{ fontSize: '1rem' }} />
            <span>{selectedFile.name}</span>
            <button type="button" onClick={handleRemoveFile} aria-label="Remove file">
              ×
            </button>
          </FilePreview>
        )}
        
        <InputRow onSubmit={handleSubmit}>
          <InputContainer>
            <UploadButton
              type="button"
              onClick={handleFileSelect}
              disabled={isSending}
              aria-label="Upload file"
            >
              <AttachFileIcon style={{ fontSize: '1.25rem' }} />
            </UploadButton>
            <FileInput
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
            />
            <ChatInput
              type="text"
              placeholder="Type your question or request..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={isSending}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </InputContainer>
          <SendButton
            type="submit"
            disabled={isSending || (!inputValue.trim() && !selectedFile)}
            onClick={handleSendWithFile}
          >
            <SendIcon style={{ fontSize: '1rem' }} />
            Send
          </SendButton>
        </InputRow>
      </ChatSurface>
    </WidgetContainer>
    </>
  );
};

export default ChatbotWidget;
