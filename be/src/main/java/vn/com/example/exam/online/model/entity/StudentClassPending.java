package vn.com.example.exam.online.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "student_class")
public class StudentClassPending {
    @Id
    String id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    User student;
    @ManyToOne
    @JoinColumn(name = "class_id")
    Class classEntity;

    public void setId() {
        this.id = student.getId().toString() + classEntity.getId();
    }
}
