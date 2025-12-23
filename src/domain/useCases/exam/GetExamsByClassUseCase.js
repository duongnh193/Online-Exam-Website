/**
 * Get Exams By Class Use Case
 * Contains business logic for fetching exams by class
 */
import examRepository from '../../../data/repositories/ExamRepository';
import ExamMapper from '../../../data/mappers/ExamMapper';

class GetExamsByClassUseCase {
  async execute(classId, page = 0, size = 10) {
    if (!classId) {
      throw new Error('Class ID is required');
    }
    
    // Fetch exams from repository
    const response = await examRepository.getExamsByClass(classId, page, size);
    
    // Process and enrich data if needed
    if (response.data) {
      let exams = [];
      
      if (response.data.content) {
        exams = response.data.content;
      } else if (Array.isArray(response.data)) {
        exams = response.data;
      }
      
      // Convert to domain entities and calculate status
      const domainExams = exams.map(examData => {
        const exam = ExamMapper.toDomain(examData);
        exam.status = exam.calculateStatus();
        return exam;
      });
      
      // Separate by status for easier consumption
      const scheduled = domainExams.filter(e => e.isScheduled());
      const ongoing = domainExams.filter(e => e.isActive());
      const completed = domainExams.filter(e => e.isCompleted());
      
      return {
        ...response,
        data: {
          ...response.data,
          content: exams, // Return API format for compatibility
          domainExams, // Also provide domain entities
          scheduled,
          ongoing,
          completed
        }
      };
    }
    
    return response;
  }
}

export default new GetExamsByClassUseCase();

