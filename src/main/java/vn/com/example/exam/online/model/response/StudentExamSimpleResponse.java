package vn.com.example.exam.online.model.response;

import vn.com.example.exam.online.model.StudentExamStatus;

import java.time.OffsetDateTime;

public record StudentExamSimpleResponse(
        String studentExamId,
        Long studentId,
        String studentName,
        StudentExamStatus status,
        OffsetDateTime startAt,
        OffsetDateTime finishAt,
        Double score
) {}
