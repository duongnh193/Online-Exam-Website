package vn.com.example.exam.online.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import vn.com.example.exam.online.model.RoleEnum;
import vn.com.example.exam.online.model.entity.StudentExam;
import vn.com.example.exam.online.model.response.ExamScoreStatisticsResponse;
import vn.com.example.exam.online.model.response.StudentExamScoreResponse;
import vn.com.example.exam.online.repository.ClassRepository;
import vn.com.example.exam.online.repository.StudentExamRepository;
import vn.com.example.exam.online.repository.UserRepository;

import java.util.List;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    private final UserRepository userRepository;
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

    public Long countByRole(RoleEnum role) {
        return userRepository.countByRole(role);
    }

    public Page<StudentExamScoreResponse> getStudentScoresInClass(Long classId, PageRequest pageRequest) {
        Page<StudentExam> studentExamsPage = studentExamRepository.findByClassId(classId, pageRequest);

        List<StudentExamScoreResponse> responses = studentExamsPage.getContent().stream()
                .collect(Collectors.groupingBy(se -> se.getStudent().getId())) // Nhóm theo studentId
                .entrySet().stream()
                .map(entry -> {
                    Long studentId = entry.getKey();
                    List<StudentExam> exams = entry.getValue();

                    double totalWeightedScore = exams.stream()
                            .mapToDouble(se -> se.getScore() * se.getExam().getCoefficient())
                            .sum();

                    double totalCoefficient = exams.stream()
                            .mapToDouble(se -> se.getExam().getCoefficient())
                            .sum();

                    double avgScore = totalCoefficient == 0 ? 0.0 : totalWeightedScore / totalCoefficient;
                    Double avgScoreIn10 = avgScore;

                    Double avgScoreIn4 = calculateScoreIn4(avgScore);

                    String studentName = exams.get(0).getStudent().getFirstName() + " " + exams.get(0).getStudent().getLastName();
                    return new StudentExamScoreResponse(studentId, studentName, avgScore, avgScoreIn10, avgScoreIn4);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageRequest, studentExamsPage.getTotalElements());
    }

    private Double calculateScoreIn4(Double avgScore) {
        if (avgScore >= 8.5) {
            return 4.0;
        } else if (avgScore >= 7.0) {
            return 3.0;
        } else if (avgScore >= 5.5) {
            return 2.0;
        } else if (avgScore >= 4.0) {
            return 1.0;
        } else {
            return 0.0;
        }
    }
}
