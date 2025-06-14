package vn.com.example.exam.online.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record QuestionDetail(
        Long questionId,
        String title,
        QuestionType type,
        List<ChoiceDto> choices,
        String answer,
        String studentAnswer,
        Boolean isCorrect
) {
}