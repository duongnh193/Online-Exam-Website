package vn.com.example.exam.online.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.example.exam.online.model.entity.Exam;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    Page<Exam> findByClassEntityId(Long classId, Pageable pageable);
    Page<Exam> findByCreatorId(Long creatorId, Pageable pageable);
}

