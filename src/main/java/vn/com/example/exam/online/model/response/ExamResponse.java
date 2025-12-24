package vn.com.example.exam.online.model.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.ExamStatus;
import vn.com.example.exam.online.model.entity.Question;

import java.time.OffsetDateTime;
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
    Long teacherId;
    String title;
    Integer duration;
    OffsetDateTime startAt;
    OffsetDateTime endAt;
    String password;
    ExamStatus status;
    long totalQuestions;
}
