package vn.com.example.exam.online.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.StudentExamStatus;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "student_exam")
public class StudentExam {
    @Id
    String id;
    @ManyToOne
    @JoinColumn(name = "exam_id")
    Exam exam;
    @ManyToOne
    @JoinColumn(name = "user_id")
    User student;
    Double score;
    OffsetDateTime startAt;
    OffsetDateTime finishAt;
    Integer time;
    @Enumerated(EnumType.STRING)
    StudentExamStatus status;
}
