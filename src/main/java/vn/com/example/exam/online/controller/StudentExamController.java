package vn.com.example.exam.online.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.com.example.exam.online.model.ExamResult;
import vn.com.example.exam.online.model.request.SubmitAnswerRequest;
import vn.com.example.exam.online.model.response.StudentExamDetailResponse;
import vn.com.example.exam.online.model.response.StudentExamResponse;
import vn.com.example.exam.online.model.response.StudentExamResultResponse;
import vn.com.example.exam.online.model.response.StudentExamSimpleResponse;
import vn.com.example.exam.online.service.StudentExamService;

import java.util.List;

@RequestMapping("/api/v1/student-exams")
@RestController
@RequiredArgsConstructor
public class StudentExamController {
    private final StudentExamService studentExamService;

    @GetMapping("/{studentExamId}")
    public ResponseEntity<StudentExamResultResponse> getStudentExam(@PathVariable String studentExamId) {
        return ResponseEntity.ok(studentExamService.getResult(studentExamId));
    }

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

    @PutMapping("/switch-tab/{studentExamId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> switchTab(@PathVariable String studentExamId) {
        studentExamService.increaseSwitchTab(studentExamId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<StudentExamSimpleResponse>> getStudentExamsByExamId(@PathVariable Long examId) {
        return ResponseEntity.ok(studentExamService.getStudentExamsByExamId(examId));
    }

    @GetMapping("/detail/{studentExamId}")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<StudentExamDetailResponse> getStudentExamDetail(@PathVariable String studentExamId) {
        return ResponseEntity.ok(studentExamService.getStudentExamDetail(studentExamId));
    }

    @GetMapping("/student/detail/{studentExamId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentExamDetailResponse> getStudentExamDetailForStudent(@PathVariable String studentExamId) {
        return ResponseEntity.ok(studentExamService.getStudentExamDetailById(studentExamId));
    }
}
