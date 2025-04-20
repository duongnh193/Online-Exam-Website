package vn.com.example.exam.online.model.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.QuestionType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateQuestionRequest {
    Long examId;
    String title;
    QuestionType type;
    String choice;
    String answer;
}
