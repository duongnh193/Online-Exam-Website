package vn.com.example.exam.online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.example.exam.online.model.entity.StudentExam;

import java.util.List;

@Repository
public interface StudentExamRepository extends JpaRepository<StudentExam, String> {
    List<StudentExam> findByExamId(Long examId);
}
