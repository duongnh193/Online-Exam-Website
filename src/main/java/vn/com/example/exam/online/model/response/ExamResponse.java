package vn.com.example.exam.online.model.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.ExamStatus;
import vn.com.example.exam.online.model.entity.Question;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExamResponse {
    Long id;
    Long classId;
    Long userId;
    String title;
    Integer duration;
    LocalDateTime startAt;
    LocalDateTime endAt;
    String password;
    ExamStatus status;
    double coefficient;
    long totalQuestions;
}
