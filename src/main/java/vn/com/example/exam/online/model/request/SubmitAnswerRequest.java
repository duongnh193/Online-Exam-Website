package vn.com.example.exam.online.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitAnswerRequest {
    @NotNull
    private String studentExamId;
    @NotNull
    private Long questionId;
    @NotNull
    private String answer;
    private Integer currentQuestionIndex;
}
