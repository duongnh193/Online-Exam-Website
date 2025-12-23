/**
 * Services Index
 * This file provides backward compatibility by exporting services from the new architecture
 * Old imports will continue to work while we migrate to Clean Architecture
 */

// Export new services from adapter (Clean Architecture)
export {
  authService,
  examService,
  classService,
  questionService,
  studentExamService,
  statisticsService
} from '../data/adapters/ServiceAdapter';

// Also export old services for backward compatibility during migration
export { default as authServiceOld } from './authService';
export { default as examServiceOld } from './examService';
export { default as classServiceOld } from './classService';
export { default as questionServiceOld } from './questionService';
export { default as studentExamServiceOld } from './studentExamService';
export { default as statisticsServiceOld } from './statisticsService';
export { default as dashboardService } from './dashboardService';
export { default as assistantService } from './assistantService';
export { default as userService } from './userService';

