package vn.com.example.exam.online.model.response;

import vn.com.example.exam.online.model.QuestionDetail;

import java.time.OffsetDateTime;
import java.util.List;

public record StudentExamDetailResponse(
        String studentExamId,
        List<OffsetDateTime> switchTab,
        List<QuestionDetail> questions
) {}
