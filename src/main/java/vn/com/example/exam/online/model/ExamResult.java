package vn.com.example.exam.online.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.Duration;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExamResult {
    long correctAnswers;
    long wrongAnswers;
    long totalQuestions;
    double score;
    long duration;

    public ExamResult(long correctAnswers, long wrongAnswers, long totalQuestions, double score, Duration duration) {
        this.correctAnswers = correctAnswers;
        this.wrongAnswers = wrongAnswers;
        this.totalQuestions = totalQuestions;
        this.score = score;
        this.duration = duration.toMinutes();
    }
}
