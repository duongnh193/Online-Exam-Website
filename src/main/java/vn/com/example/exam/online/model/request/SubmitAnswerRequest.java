package vn.com.example.exam.online.model.request;

import lombok.Data;

@Data
public class SubmitAnswerRequest {
    private String studentExamId;
    private Long questionId;
    private String answer;
}
