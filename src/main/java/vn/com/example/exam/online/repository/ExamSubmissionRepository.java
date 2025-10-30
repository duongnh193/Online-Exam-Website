package vn.com.example.exam.online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.example.exam.online.model.entity.ExamSubmission;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {
    List<ExamSubmission> findByStudentExamId(String studentExamId);
    List<ExamSubmission> findByQuestionId(Long questionId);
    Optional<ExamSubmission> findTopByStudentExamIdAndQuestionIdOrderByIdDesc(String studentExamId, Long questionId);
}
