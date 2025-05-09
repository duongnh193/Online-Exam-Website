package vn.com.example.exam.online.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.com.example.exam.online.model.entity.StudentExam;
import vn.com.example.exam.online.model.response.ExamScoreStatisticsResponse;
import vn.com.example.exam.online.repository.ClassRepository;
import vn.com.example.exam.online.repository.StudentExamRepository;

import java.util.List;
import java.util.OptionalDouble;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    private final ClassRepository classRepository;
    private final StudentExamRepository studentExamRepository;


    public Long getTotalClasses() {
        return classRepository.count();
    }

    public Long getTotalExamsInClass(Long classId) {
        return classRepository.findById(classId)
                .map(clazz -> (long) clazz.getExams().size())
                .orElse(0L);
    }

    public ExamScoreStatisticsResponse getExamScoreStatistics(Long examId) {
        List<StudentExam> studentExams = studentExamRepository.findByExamId(examId);

        if (studentExams.isEmpty()) {
            return new ExamScoreStatisticsResponse(0.0, 0.0, 0.0);
        }

        // Tính điểm nhỏ nhất, lớn nhất và trung bình
        OptionalDouble minScore = studentExams.stream()
                .mapToDouble(StudentExam::getScore)
                .min();

        OptionalDouble maxScore = studentExams.stream()
                .mapToDouble(StudentExam::getScore)
                .max();

        OptionalDouble avgScore = studentExams.stream()
                .mapToDouble(StudentExam::getScore)
                .average();

        return new ExamScoreStatisticsResponse(
                minScore.orElse(0.0),
                maxScore.orElse(0.0),
                avgScore.orElse(0.0)
        );
    }
}
