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
import org.springframework.web.multipart.MultipartFile;
import vn.com.example.exam.online.model.request.CreateQuestionRequest;
import vn.com.example.exam.online.model.response.ExamResponse;
import vn.com.example.exam.online.model.response.QuestionResponse;
import vn.com.example.exam.online.service.QuestionService;
import vn.com.example.exam.online.util.Constants;

import java.util.List;

@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @Operation(
            summary = "Create REST API",
            description = "Create question")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<QuestionResponse> create(@RequestBody @Valid CreateQuestionRequest createQuestionRequest) {
        return ResponseEntity.ok(questionService.create(createQuestionRequest));
    }

    @Operation(
            summary = "Update REST API",
            description = "Update question")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PutMapping("/{questionId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<QuestionResponse> update(@RequestBody @Valid CreateQuestionRequest createQuestionRequest, @PathVariable Long questionId) {
        return ResponseEntity.ok(questionService.update(createQuestionRequest, questionId));
    }

    @Operation(
            summary = "Delete REST API",
            description = "Delete question by id")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<Void> delete(@PathVariable Long questionId) {
        questionService.delete(questionId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Get class REST API",
            description = "Get question by id")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/{questionId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<QuestionResponse> getQuestionById(@PathVariable Long questionId) {
        return ResponseEntity.ok(questionService.getQuestionById(questionId));
    }

    @Operation(
            summary = "Get questions REST API",
            description = "Get all questions in exam")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping()
    public ResponseEntity<Page<QuestionResponse>> getQuestions(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size,
            @RequestParam(required = false) Sort sort,
            @RequestParam() Long examId
    ) {
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(questionService.getQuestionsByExam(examId, pageable));
    }

    @Operation(
            summary = "Import questions REST API",
            description = "Import questions from csv")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PostMapping("/questions/import")
    public ResponseEntity<List<QuestionResponse>> importQuestions(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(questionService.importFromCsv(file));
    }

}
