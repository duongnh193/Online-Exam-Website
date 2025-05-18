package vn.com.example.exam.online.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.com.example.exam.online.model.entity.StudentExam;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentExamResponse {
    private StudentExam studentExam;
    private QuestionExamResponse nextQuestion;
    private boolean isLastQuestion;
    private Long minuteRemaining;
}
