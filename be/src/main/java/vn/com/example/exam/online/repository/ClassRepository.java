package vn.com.example.exam.online.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.example.exam.online.model.entity.Class;

@Repository
public interface ClassRepository extends JpaRepository<Class,Long> {
    Page<Class> findByTeacherId(Long teacherId, Pageable pageable);
    Long countByTeacherId(Long teacherId);
}
