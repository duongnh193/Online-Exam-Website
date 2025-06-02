package vn.com.example.exam.online.model.response;

import vn.com.example.exam.online.model.QuestionDetail;

import java.util.List;

public record StudentExamDetailResponse(
        String studentExamId,
        int switchTab,
        List<QuestionDetail> questions
) {}
