package vn.com.example.exam.online.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamResult {
    private long correctAnswers;
    private long wrongAnswers;
}
