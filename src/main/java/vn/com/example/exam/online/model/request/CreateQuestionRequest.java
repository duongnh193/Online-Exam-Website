package vn.com.example.exam.online.model.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.ChoiceDto;
import vn.com.example.exam.online.model.QuestionType;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateQuestionRequest {
    Long examId;
    String title;
    QuestionType type;
    List<ChoiceDto> choices;
    String answer;
    String image;
}
