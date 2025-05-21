package vn.com.example.exam.online.model.request;

import jakarta.validation.constraints.NotNull;
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
    @NotNull
    Long classId;
    @NotNull
    String title;
    @NotNull
    Integer duration;
    LocalDateTime startAt;
    LocalDateTime endAt;
    @NotNull
    String password;
    ExamStatus status;
    @NotNull
    double coefficient;
}
