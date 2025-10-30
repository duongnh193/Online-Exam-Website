package vn.com.example.exam.online.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionStateResponse {
    private Long questionId;
    private Integer index;
    private boolean answered;
    private Boolean correct;
}
