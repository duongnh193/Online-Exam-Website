package vn.com.example.exam.online.model.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
    @Size(max = 255)
    @Pattern(regexp = "^[\\p{L}\\d\\s]+$",
            message = "Only letters and spaces are allowed, special characters are not permitted.")
    String title;
    @NotNull
    @Min(value = 1)
    Integer duration;
    @NotNull
    LocalDateTime startAt;
    @NotNull
    LocalDateTime endAt;
    @NotNull
    @Pattern(
            regexp = "^[a-zA-Z0-9!@#$%^&*()_+=\\-\\[\\]{}|:;\"',.<>?/`~\\\\]+$",
            message = "Only English letters, numbers, and special characters are allowed. No spaces or accented characters."
    )
    String password;
    ExamStatus status;
}
