import React, { useState } from 'react';
import styled from 'styled-components';
import statisticsService from '../../services/statisticsService';
import dashboardService from '../../services/dashboardService';
import assistantService from '../../services/assistantService';
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
`;

const ChatSurface = styled.div`
  flex: 1;
  background: var(--bg-secondary, #ffffff);
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(80, 72, 229, 0.15);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const WidgetHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background: rgba(106, 0, 255, 0.08);
  color: #6a00ff;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: rgba(106, 0, 255, 0.14);
    transform: translateY(-1px);
  }

  &:disabled {
    background: rgba(106, 0, 255, 0.18);
    cursor: not-allowed;
    transform: none;
  }
`;

const ConversationPane = styled.div`
  flex: 1;
  background: rgba(106, 0, 255, 0.05);
  border-radius: 16px;
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
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
    role === 'user' ? '#6a00ff' : 'white'};
  color: ${({ role }) => (role === 'user' ? 'white' : '#333')};
  box-shadow: ${({ role }) =>
    role === 'user'
      ? '0 6px 16px rgba(106, 0, 255, 0.25)'
      : '0 4px 12px rgba(15, 23, 42, 0.08)'};
  white-space: pre-line;
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
  gap: 0.85rem;
  margin-top: 1rem;
`;

const ChatInput = styled.input`
  flex: 1;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 0.65rem 1rem;
  font-size: 0.9rem;
  background: white;
  color: var(--text-primary, #1f1f1f);

  &:focus {
    outline: none;
    border-color: #6a00ff;
    box-shadow: 0 0 0 3px rgba(106, 0, 255, 0.16);
  }
`;

const SendButton = styled.button`
  border-radius: 999px;
  border: none;
  background: #6a00ff;
  color: white;
  padding: 0.65rem 1.4rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #5a00d4;
    transform: translateY(-1px);
  }

  &:disabled {
    background: rgba(106, 0, 255, 0.35);
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  color: rgba(15, 23, 42, 0.7);
  font-size: 0.9rem;
  text-align: center;
`;

const INTRO_MESSAGES = {
  student:
    'Chao ban! Toi co the phan tich diem cua ban de goi y huong hoc va cung cap huong dan su dung he thong.',
  lecturer:
    'Chao giang vien! Toi ho tro tong quan lop, xay dung de va tao ke hoach bo tro cho sinh vien.'
};

const SECONDARY_HINT =
  'Hay chon mot nut goi y hoac nhap tu khoa nhu "Goi y hoc tap", "Huong dan su dung", "Bao cao lop".';

const SUGGESTIONS = {
  student: [
    { label: 'Goi y hoc tap', intent: 'learning' },
    { label: 'Toi muon xem diem yeu', intent: 'learning_focus' },
    { label: 'Huong dan su dung', intent: 'guide' }
  ],
  lecturer: [
    { label: 'Tong quan lop', intent: 'lecturer_overview' },
    { label: 'Cai thien chat luong de', intent: 'lecturer_quality' },
    { label: 'Huong dan su dung', intent: 'guide' }
  ],
  default: [
    { label: 'Huong dan su dung', intent: 'guide' },
    { label: 'Goi y hoc tap', intent: 'learning' }
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
    lower.includes('huong dan') ||
    lower.includes('cach su dung') ||
    lower.includes('dang nhap') ||
    lower.includes('website') ||
    lower.includes('help')
  ) {
    return 'guide';
  }

  if (
    lower.includes('hoc tap') ||
    lower.includes('diem') ||
    lower.includes('ket qua') ||
    lower.includes('on tap') ||
    lower.includes('mon') ||
    lower.includes('thanh tich')
  ) {
    return 'learning';
  }

  if (
    role === 'lecturer' &&
    (lower.includes('lop') ||
      lower.includes('bao cao') ||
      lower.includes('quan ly') ||
      lower.includes('chat luong') ||
      lower.includes('de thi')))
   {
    return lower.includes('chat luong') ? 'lecturer_quality' : 'lecturer_overview';
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
      (item.classId ? `Lop ${item.classId}` : 'Lop chua ro ten');
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
    `Tong quan: diem trung binh hien tai cua ban khoang ${overall.toFixed(1)}/10 tren ${sorted.length} lop co diem.`
  );

  if (!focusLowOnly && strongest.length) {
    const bestList = strongest
      .map((item) => `${item.label} (${item.score10.toFixed(1)})`)
      .join('; ');
    lines.push(`Mon manh hien tai: ${bestList}. Hay giu phong do va chia se kinh nghiem cho ban cung lop neu duoc.`);
  }

  if (lowSubjects.length) {
    const lowList = lowSubjects
      .map((item) => `${item.label} (${item.score10.toFixed(1)})`)
      .join('; ');
    lines.push(
      `Mon can uu tien on tap: ${lowList}. Thu tach nho muc tieu va lap lich on lai trong tuan nay.`
    );
    lines.push(
      `De cai thien nhanh: ${studentStudyTips.lowScoreAdvice.slice(0, 3).join('; ')}.`
    );
  } else if (weakest.length) {
    const weakList = weakest
      .map((item) => `${item.label} (${item.score10.toFixed(1)})`)
      .join('; ');
    lines.push(`Mon co diem thap nhat hien tai: ${weakList}. Ban nen xem lai bai ghi va hoi giang vien som.`);
  }

  if (!focusLowOnly) {
    lines.push(`Meo duoc de xuat: ${studentStudyTips.defaultAdvice.join('; ')}.`);
  }

  return lines.join('\n');
};

const buildGuideResponse = (role) => {
  const sections = usageGuides[role] || usageGuides.student;
  const lines = ['Huong dan nhanh:'];

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
    lines.push('Cau hoi pho bien:');
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
    `Tong quan: ban dang quan ly khoang ${classCount} lop va ${examCount} bai thi. Nen kiem tra muc Reports hang tuan de theo doi diem.`
  );
  lines.push(
    'Hay su dung tab Class de thong bao nhanh cho sinh vien va cap nhat tai lieu trong muc Resources hoac Files.'
  );

  lines.push(`Goi y hanh dong nhanh: ${lecturerQualityTips.quickWins.join('; ')}.`);

  if (includeQuality) {
    lines.push(
      `Cai thien kho cau hoi: ${lecturerQualityTips.questionBank.join('; ')}.`
    );
    lines.push(`Ke hoach bo tro sau thi: ${lecturerQualityTips.followUp.join('; ')}.`);
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
      text: 'Khong nhan duoc phan hoi tu mo hinh AI. Vui long kiem tra backend cau hinh.',
      source: 'Gemini (API)'
    };
  } catch (error) {
    console.error('Failed to connect Gemini assistant:', error);
    let errorMessage = 'Khong ket noi duoc voi mo hinh AI. Hay thu lai sau.';
    if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage = 'Chua cau hinh API key hop le cho mo hinh AI.';
    }
    return {
      text: errorMessage,
      source: 'Gemini (API)'
    };
  }
};

const ChatbotWidget = ({ userRole = 'student', user = null }) => {
  const normalizedRole = userRole === 'lecturer' ? 'lecturer' : 'student';
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', text: INTRO_MESSAGES[normalizedRole], source: 'intro' },
    { role: 'assistant', text: SECONDARY_HINT, source: 'guide' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  const activeSuggestions =
    SUGGESTIONS[normalizedRole] || SUGGESTIONS.default;

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
          text: 'Ban co the xem bao cao diem cua sinh vien tai muc Reports va loc theo lop de gui phan hoi ca nhan hoa.',
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
            text: 'Khong tim thay ma giang vien. Hay dang xuat va dang nhap lai.',
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
        text: 'Khong lay duoc du lieu diem. Hay thu lai sau vai phut.',
        source: 'Analytics'
      };
    }
    return {
      text: 'Toi gap loi khi xu ly yeu cau nay. Ban vui long thu lai nhe.',
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

  return (
    <WidgetContainer>
      <ChatSurface>
        <WidgetHeader>
          <Title>
            <h2>AI Assistant (beta)</h2>
            <span>
              Tro ly ao giup {normalizedRole === 'lecturer' ? 'giang vien quan ly lop va cai thien chat luong de' : 'sinh vien dinh huong on tap va lam quen he thong'}
            </span>
          </Title>
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
            <EmptyState>Hay dat cau hoi de bat dau cuoc tro chuyen.</EmptyState>
          ) : (
            messages.map((message, idx) => (
              <Message role={message.role} key={`${message.role}-${idx}`}>
                {message.text}
                {message.role === 'assistant' && message.source && (
                  <SourceBadge role={message.role}>
                    {message.source.toUpperCase()}
                  </SourceBadge>
                )}
              </Message>
            ))
          )}
        </ConversationPane>

        <InputRow onSubmit={handleSubmit}>
          <ChatInput
            type="text"
            placeholder="Viet cau hoi hoac yeu cau cua ban..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            disabled={isSending}
          />
          <SendButton type="submit" disabled={isSending}>
            Gui
          </SendButton>
        </InputRow>
      </ChatSurface>
    </WidgetContainer>
  );
};

export default ChatbotWidget;
