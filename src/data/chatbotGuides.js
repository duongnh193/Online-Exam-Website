export const usageGuides = {
  student: [
    {
      title: 'Getting Started',
      steps: [
        'Login with your provided account',
        'Go to Exams section to view upcoming exams',
        'Check Results section after each exam to track progress'
      ]
    },
    {
      title: 'Getting Familiar with Interface',
      steps: [
        'Left sidebar helps navigate between Dashboard, Exams and Results',
        'Theme button at top right switches between light and dark mode',
        'Notifications appear at top when there are new exam schedules or reminders'
      ]
    },
    {
      title: 'When Facing Difficulties',
      steps: [
        'Use Guide section in dashboard to watch tutorial videos',
        'Contact lecturer if unable to access exam',
        'Use Support button if you want to send support request'
      ]
    }
  ],
  lecturer: [
    {
      title: 'Quick Setup',
      steps: [
        'Go to Exams > Create Exam to create new test',
        'Assign classes from Class section and invite students',
        'Set clear open and close times for exams'
      ]
    },
    {
      title: 'Class Management',
      steps: [
        'Use Class tab to view enrollment statistics and status',
        'Combine with Reports to view average scores by class',
        'Remember to update class content in Settings section'
      ]
    },
    {
      title: 'When You Need Support',
      steps: [
        'Use FAQ section on system homepage',
        'Send request to technical department if encountering errors',
        'Create review plans by downloading and sharing guide files'
      ]
    }
  ]
};

export const studentStudyTips = {
  outstandingThreshold: 8,
  warningThreshold: 6.5,
  defaultAdvice: [
    'Schedule weekly review sessions, prioritize subjects with low scores first',
    'Supplement materials from Results > Class Results > View detail',
    'Break down goals into small steps, review weekly'
  ],
  lowScoreAdvice: [
    'Review class notes and check sample answers in Results',
    'Ask lecturer about difficult parts or request tutoring',
    'Join study groups to share experiences'
  ],
  highlightAdvice: [
    'Maintain current momentum by stabilizing study schedule',
    'Can help classmates by sharing experiences',
    'Try advanced exercises if lecturer provides materials'
  ]
};

export const lecturerQualityTips = {
  quickWins: [
    'Use Reports section to view classes with below average scores and create support plans',
    'Update concise syllabus for each class in Class > View section',
    'Keep exam Status clear: Scheduled, Ongoing, Completed'
  ],
  questionBank: [
    'After each exam period, list questions with high error rates for revision',
    'Use standardized spreadsheet for objectives of each question',
    'Perform peer review by exchanging with lecturers in the department'
  ],
  followUp: [
    'Send notifications from Dashboard to students with low scores',
    'Strengthen introduction of review materials before major exams',
    'Store statistics in external tables to compare across periods'
  ]
};

export const websiteFaq = [
  {
    question: 'Where do I create or change password?',
    answer: 'Go to Settings > Account > Change password, enter old and new password.'
  },
  {
    question: 'How to view detailed scores?',
    answer: 'Students go to Results > Class Results > select class > View detail to see each exam.'
  },
  {
    question: 'Cannot access exam?',
    answer: 'Check exam open time, refresh the page, if still encountering errors then contact technical support.'
  }
];

export const fallbackMessages = {
  generic:
    'I did not fully understand your request. You can try keywords: "Study suggestions", "Usage guide", "Class report", or select suggestion buttons above.',
  missingScores:
    'No score data available for analysis. Please complete at least one exam or check Results page again.'
};
