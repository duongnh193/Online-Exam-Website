package vn.com.example.exam.online.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.Accessors;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.ExamStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "exam")
@ToString(exclude = {"classEntity", "creator", "questions"})
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @ManyToOne
    @JoinColumn(name = "class_id")
    Class classEntity;
    @ManyToOne
    @JoinColumn(name = "user_id")
    User creator;
    String title;
    Integer duration;
    LocalDateTime startAt;
    LocalDateTime endAt;
    String password;
    @Enumerated(EnumType.STRING)
    ExamStatus status;
    @OneToMany(mappedBy = "exam")
    List<Question> questions = new ArrayList<>();
}
