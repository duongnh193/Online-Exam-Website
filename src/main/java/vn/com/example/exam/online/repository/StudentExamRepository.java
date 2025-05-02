package vn.com.example.exam.online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.example.exam.online.model.entity.StudentExam;

@Repository
public interface StudentExamRepository extends JpaRepository<StudentExam, String> {
}
