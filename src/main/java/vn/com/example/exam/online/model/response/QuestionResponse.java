package vn.com.example.exam.online.model.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.ChoiceDto;
import vn.com.example.exam.online.model.QuestionType;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionResponse {
    Long id;
    Long examId;
    Long creatorId;
    String title;
    QuestionType type;
    List<ChoiceDto> choices;
    String answer;
    String image;
}
