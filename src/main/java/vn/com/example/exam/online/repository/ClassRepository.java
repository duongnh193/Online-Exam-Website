package vn.com.example.exam.online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.example.exam.online.model.entity.Class;

public interface ClassRepository extends JpaRepository<Class,Long> {
}
