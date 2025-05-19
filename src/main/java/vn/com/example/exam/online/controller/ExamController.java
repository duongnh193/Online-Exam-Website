package vn.com.example.exam.online.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.com.example.exam.online.model.request.CreateExamRequest;
import vn.com.example.exam.online.model.response.ExamResponse;
import vn.com.example.exam.online.model.response.PasswordExamResponse;
import vn.com.example.exam.online.service.ExamService;
import vn.com.example.exam.online.util.Constants;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
public class ExamController {
    private final ExamService examService;

    @Operation(
            summary = "Create REST API",
            description = "Create exam")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or @classService.isCurrentUserTeacherOfClass(#createExamRequest.getClassId())")
    public ResponseEntity<ExamResponse> create(@RequestBody @Valid CreateExamRequest createExamRequest) {
        return ResponseEntity.ok(examService.create(createExamRequest));
    }

    @Operation(
            summary = "Update REST API",
            description = "Update exam")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PutMapping("/{examId}")
    @PreAuthorize("hasRole('ADMIN') or @classService.isCurrentUserTeacherOfClass(#createExamRequest.getClassId())")
    public ResponseEntity<ExamResponse> update(@RequestBody @Valid CreateExamRequest createExamRequest, @PathVariable Long examId) {
        return ResponseEntity.ok(examService.update(createExamRequest, examId));
    }

    @Operation(
            summary = "Delete REST API",
            description = "Delete exam by id")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @DeleteMapping("/{examId}")
    @PreAuthorize("hasRole('ADMIN') or @classService.isCurrentUserTeacherOfClass(#createExamRequest.getClassId())")
    public ResponseEntity<Void> delete(@PathVariable Long examId) {
        examService.delete(examId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Get class REST API",
            description = "Get exam by id")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/{examId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ExamResponse> getExamById(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getExamById(examId));
    }

    @Operation(
            summary = "Get exams REST API",
            description = "Get all exams in class")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping()
    public ResponseEntity<Page<ExamResponse>> getExams(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size,
            @RequestParam() Long classId
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(examService.getExamsByClass(classId, pageable));
    }

    @Operation(
            summary = "Get class REST API",
            description = "Get password exam by examId")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/password/{examId}")
    public ResponseEntity<PasswordExamResponse> getPass(@PathVariable Long examId) {
        return ResponseEntity.ok(examService.getPasswordExam(examId));
    }
}
