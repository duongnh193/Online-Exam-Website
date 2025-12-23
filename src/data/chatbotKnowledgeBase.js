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
        tags: ['guide', 'getting started', 'tutorial', 'website', 'help'],
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
      tags: ['faq', 'question', 'help', 'support', 'issue'],
      rawText: `${faq.question} ${faq.answer}`
    });
  });

  // Quick references for study tips and lecturer follow-up
  entries.push({
    id: 'student_default_tips',
    role: 'student',
    title: 'General Study Tips',
    question: 'Study suggestions for students',
    answer: `General Study Tips:\n${studentStudyTips.defaultAdvice.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}`,
    tags: ['study', 'results', 'learning', 'tips'],
    rawText: studentStudyTips.defaultAdvice.join(' ')
  });

  entries.push({
    id: 'student_low_score_tips',
    role: 'student',
    title: 'Improving Low Scores',
    question: 'What should I do if I have low scores?',
    answer: `Improving Low Scores:\n${studentStudyTips.lowScoreAdvice.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}`,
    tags: ['low score', 'improve', 'study', 'help'],
    rawText: studentStudyTips.lowScoreAdvice.join(' ')
  });

  entries.push({
    id: 'lecturer_quality_followup',
    role: 'lecturer',
    title: 'Improving Exam and Class Quality',
    question: 'How to improve class results?',
    answer: `Suggested Steps:\n${lecturerQualityTips.followUp.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}`,
    tags: ['lecturer', 'quality', 'class', 'report', 'improvement'],
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
