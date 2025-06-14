package vn.com.example.exam.online.model.response;

import vn.com.example.exam.online.model.QuestionType;

import java.util.Map;

public record AnswerStatResponse(
        Long questionId,
        String questionTitle,
        QuestionType type,
        Map<String, Long> answerStats,
        Long totalAnswers
) {}