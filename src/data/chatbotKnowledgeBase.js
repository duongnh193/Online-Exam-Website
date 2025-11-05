import {
  usageGuides,
  websiteFaq,
  studentStudyTips,
  lecturerQualityTips
} from './chatbotGuides';
import { calculateSimilarity } from '../utils/textSimilarity';

const flattenGuideEntries = () => {
  const entries = [];

  Object.entries(usageGuides).forEach(([role, sections]) => {
    sections.forEach((section) => {
      const content = section.steps.join(' ; ');
      entries.push({
        id: `${role}_${section.title}`.toLowerCase().replace(/\s+/g, '_'),
        role,
        title: section.title,
        question: section.title,
        answer: `${section.title}:\n${section.steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`,
        tags: ['guide', 'huong dan', 'bat dau', 'website'],
        rawText: `${section.title} ${content}`
      });
    });
  });

  websiteFaq.forEach((faq, index) => {
    entries.push({
      id: `faq_${index}`,
      role: 'all',
      title: faq.question,
      question: faq.question,
      answer: faq.answer,
      tags: ['faq', 'hoi dap', 'tro giup', 'su co'],
      rawText: `${faq.question} ${faq.answer}`
    });
  });

  // Quick references for study tips and lecturer follow-up
  entries.push({
    id: 'student_default_tips',
    role: 'student',
    title: 'Meo on tap chung',
    question: 'Goi y on tap cho sinh vien',
    answer: `Meo on tap chung:\n${studentStudyTips.defaultAdvice.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}`,
    tags: ['hoc tap', 'ket qua', 'study'],
    rawText: studentStudyTips.defaultAdvice.join(' ')
  });

  entries.push({
    id: 'student_low_score_tips',
    role: 'student',
    title: 'Khac phuc diem thap',
    question: 'Toi diem thap thi lam sao?',
    answer: `Khac phuc diem thap:\n${studentStudyTips.lowScoreAdvice.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}`,
    tags: ['diem thap', 'cai thien', 'study'],
    rawText: studentStudyTips.lowScoreAdvice.join(' ')
  });

  entries.push({
    id: 'lecturer_quality_followup',
    role: 'lecturer',
    title: 'Cai thien chat luong de va lop',
    question: 'Lam sao cai thien ket qua lop?',
    answer: `Cac buoc goi y:\n${lecturerQualityTips.followUp.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}`,
    tags: ['lecturer', 'quality', 'lop', 'bao cao'],
    rawText: lecturerQualityTips.followUp.join(' ')
  });

  return entries;
};

const knowledgeEntries = flattenGuideEntries();

const isRoleMatch = (entryRole, userRole) => {
  if (entryRole === 'all') return true;
  return entryRole === userRole;
};

export const searchKnowledgeBase = (query, userRole, options = {}) => {
  const threshold = options.threshold ?? 0.42;
  const role = userRole === 'lecturer' ? 'lecturer' : userRole === 'student' ? 'student' : 'all';

  let bestEntry = null;
  let bestScore = 0;

  knowledgeEntries.forEach((entry) => {
    if (!isRoleMatch(entry.role, role)) {
      return;
    }

    const combinedText = `${entry.question} ${entry.rawText} ${entry.tags.join(' ')}`;
    const score = calculateSimilarity(query, combinedText);

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  });

  if (bestScore >= threshold && bestEntry) {
    return {
      ...bestEntry,
      score: bestScore
    };
  }

  return null;
};

export const getKnowledgeEntries = () => knowledgeEntries;
