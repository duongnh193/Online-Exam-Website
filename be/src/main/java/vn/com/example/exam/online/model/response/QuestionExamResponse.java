package vn.com.example.exam.online.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.com.example.exam.online.model.ChoiceDto;
import vn.com.example.exam.online.model.QuestionType;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionExamResponse {
    private Long id;
    private String title;
    private QuestionType type;
    private List<ChoiceDto> choices;
    private String image;
}
