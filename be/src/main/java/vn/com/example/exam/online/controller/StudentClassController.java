package vn.com.example.exam.online.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.service.StudentClassService;
import vn.com.example.exam.online.util.Constants;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class StudentClassController {
    private final StudentClassService studentClassService;

    @Operation(
            summary = "Import students from CSV file",
            description = "This API allows importing a list of students from a CSV file to a class"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully imported students. Returns the count of students added to the class."
    )
    @PostMapping("/{classId}/import")
    @PreAuthorize("hasRole('ADMIN') or @classService.isCurrentUserTeacherOfClass(#classId)")
    public ResponseEntity<String> importStudentsToClass(
            @PathVariable Long classId,
            @RequestParam("file") MultipartFile file
    ) {
        int count = studentClassService.importStudentsFromCsv(file, classId);
        return ResponseEntity.ok(Constants.ADD_STUDENT_CSV_SUCCESS.formatted(count));
    }

    @Operation(
            summary = "Add student to class by username or email",
            description = "This API allows adding a student to a class by providing their username or email"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully added the student to the class."
    )
    @ApiResponse(
            responseCode = "400",
            description = "Bad request. If the student with the provided username or email is not found."
    )
    @PostMapping("/{classId}/add-student")
    @PreAuthorize("hasRole('ADMIN') or @classService.isCurrentUserTeacherOfClass(#classId)")
    public ResponseEntity<String> addStudentToClass(
            @PathVariable Long classId,
            @RequestParam String usernameOrEmail
    ) {
        boolean success = studentClassService.addStudentToClass(classId, usernameOrEmail);
        if (success) {
            return ResponseEntity.ok(Constants.ADD_STUDENT_SUCCESS);
        } else {
            return ResponseEntity.status(400).body(Constants.ADD_STUDENT_FAILED);
        }
    }

    @Operation(
            summary = "Remove student from class",
            description = "This API allows removing a student from a class by providing the student's username or email"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Successfully removed the student from the class."
    )
    @ApiResponse(
            responseCode = "400",
            description = "Bad request. If the student with the provided username or email is not found, or if they are not part of the class."
    )
    @DeleteMapping("/{classId}/remove-student")
    @PreAuthorize("hasRole('ADMIN') or @classService.isCurrentUserTeacherOfClass(#classId)")
    public ResponseEntity<String> removeStudentFromClass(
            @PathVariable Long classId,
            @RequestParam String usernameOrEmail
    ) {
        boolean success = studentClassService.removeStudentFromClass(classId, usernameOrEmail);
        if (success) {
            return ResponseEntity.ok(Constants.REMOVE_STUDENT_SUCCESS);
        } else {
            return ResponseEntity.status(400).body(Constants.REMOVE_STUDENT_FAILED);
        }
    }
}
