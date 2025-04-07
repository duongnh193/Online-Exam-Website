package vn.com.example.exam.online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.example.exam.online.model.entity.StudentClass;

public interface StudentClassRepository extends JpaRepository<StudentClass, String> {
}
