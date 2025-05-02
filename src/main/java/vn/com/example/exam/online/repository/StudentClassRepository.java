package vn.com.example.exam.online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.example.exam.online.model.entity.StudentClass;

@Repository
public interface StudentClassRepository extends JpaRepository<StudentClass, String> {
    boolean existsByStudentIdAndClassEntityId(Long studentId, Long classEntityId);
}
