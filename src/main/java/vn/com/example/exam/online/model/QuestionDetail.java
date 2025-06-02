package vn.com.example.exam.online.model;

import java.util.List;

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