/**
 * Create Exam Use Case
 * Contains business logic for creating an exam
 */
import examRepository from '../../../data/repositories/ExamRepository';
import Exam from '../../entities/Exam';

class CreateExamUseCase {
  async execute(examData) {
    // Business logic validation
    if (!examData.title || examData.title.trim().length === 0) {
      throw new Error('Exam title is required');
    }
    
    if (examData.duration <= 0) {
      throw new Error('Exam duration must be positive');
    }
    
    if (!examData.classId) {
      throw new Error('Class ID is required');
    }
    
    if (!examData.startAt || !examData.endAt) {
      throw new Error('Start and end times are required');
    }
    
    const startTime = new Date(examData.startAt);
    const endTime = new Date(examData.endAt);
    
    if (startTime >= endTime) {
      throw new Error('End time must be after start time');
    }
    
    // Create domain entity to validate
    const exam = new Exam({
      ...examData,
      startAt: startTime,
      endAt: endTime
    });
    
    // Use repository to persist
    return await examRepository.createExam({
      ...examData,
      startAt: startTime.toISOString(),
      endAt: endTime.toISOString()
    });
  }
}

export default new CreateExamUseCase();

