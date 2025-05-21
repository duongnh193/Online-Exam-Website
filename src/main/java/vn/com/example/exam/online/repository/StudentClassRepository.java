package vn.com.example.exam.online.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.example.exam.online.model.entity.StudentClass;

import java.util.List;

@Repository
public interface StudentClassRepository extends JpaRepository<StudentClass, String> {
    boolean existsByStudentIdAndClassEntityId(Long studentId, Long classEntityId);
    Page<StudentClass> findByStudentId(Long studentId, Pageable pageable);
    Page<StudentClass> findByClassEntityId(Long classEntityId, Pageable pageable);
    List<StudentClass> findByStudentId(Long studentId);
}
