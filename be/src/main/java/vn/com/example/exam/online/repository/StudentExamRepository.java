package vn.com.example.exam.online.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.com.example.exam.online.model.entity.StudentExam;

import java.util.List;

@Repository
public interface StudentExamRepository extends JpaRepository<StudentExam, String> {
    List<StudentExam> findByExamId(Long examId);
    @Query("SELECT se FROM StudentExam se WHERE se.exam.classEntity.id = :classId")
    Page<StudentExam> findByClassId(@Param("classId") Long classId, Pageable pageable);
}
