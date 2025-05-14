package vn.com.example.exam.online.model.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.ExamStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateExamRequest {
    Long classId;
    String title;
    Integer duration;
    LocalDateTime startAt;
    LocalDateTime endAt;
    String password;
    ExamStatus status;
    double coefficient;
}
