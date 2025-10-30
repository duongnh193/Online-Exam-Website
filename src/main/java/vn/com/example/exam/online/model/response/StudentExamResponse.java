package vn.com.example.exam.online.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.com.example.exam.online.model.entity.StudentExam;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentExamResponse {
    private StudentExam studentExam;
    private QuestionExamResponse question;
    private Integer currentIndex;
    private Integer totalQuestions;
    private String answer;
    private List<QuestionStateResponse> questionStates;
    private boolean firstQuestion;
    private boolean lastQuestion;
    private boolean completed;
    private Long secondsRemaining;
}
