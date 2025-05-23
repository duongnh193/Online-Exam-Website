package vn.com.example.exam.online.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Convert;
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
import vn.com.example.exam.online.model.ChoiceDto;
import vn.com.example.exam.online.model.QuestionType;
import vn.com.example.exam.online.util.ChoiceDtoConverter;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "question")
@ToString(exclude = {"exam", "creator", "examSubmissions"})
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @ManyToOne
    @JoinColumn(name = "exam_id")
    @JsonIgnore
    Exam exam;
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    User creator;
    String title;
    @Enumerated(EnumType.STRING)
    QuestionType type;
    @Convert(converter = ChoiceDtoConverter.class)
    List<ChoiceDto> choices;
    String answer;
    @OneToMany(mappedBy = "question")
    @JsonIgnore
    List<ExamSubmission> examSubmissions = new ArrayList<>();
    String image;
}
