package vn.com.example.exam.online.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.com.example.exam.online.model.ExamResult;
import vn.com.example.exam.online.model.request.SubmitAnswerRequest;
import vn.com.example.exam.online.model.response.StudentExamResponse;
import vn.com.example.exam.online.service.StudentExamService;

@RequestMapping("/api/v1/student-exams")
@RestController
@RequiredArgsConstructor
public class StudentExamController {
    private final StudentExamService studentExamService;

    @PostMapping("/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentExamResponse> startExam(@RequestParam Long examId, @RequestParam String password) {
        return ResponseEntity.ok(studentExamService.startExam(examId, password));
    }

    @PostMapping("/submit-answer")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentExamResponse> submitAnswer(
            @RequestBody SubmitAnswerRequest request
    ) {
        return ResponseEntity.ok(
                studentExamService.submitAnswer(
                        request.getStudentExamId(),
                        request.getQuestionId(),
                        request.getAnswer()
                )
        );
    }

    // Nộp toàn bài thi
    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ExamResult> submitExam(@RequestParam String studentExamId) {
        return ResponseEntity.ok(studentExamService.submitExam(studentExamId));
    }
}
