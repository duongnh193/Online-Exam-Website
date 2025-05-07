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
import vn.com.example.exam.online.mapper.Class2ClassResponse;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.request.CreateClassRequest;
import vn.com.example.exam.online.model.response.ClassResponse;
import vn.com.example.exam.online.service.ClassService;
import vn.com.example.exam.online.service.StudentClassService;
import vn.com.example.exam.online.util.Constants;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassController {
    private final ClassService classService;
    private final StudentClassService studentClassService;

    @Operation(
            summary = "Create REST API",
            description = "Create class")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ClassResponse> create(@RequestBody @Valid CreateClassRequest createClassRequest) {
        return ResponseEntity.ok(Class2ClassResponse.INSTANCE.map(classService.create(createClassRequest)));
    }

    @Operation(
            summary = "Update REST API",
            description = "Update class")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PutMapping("/{classId}")
    @PreAuthorize("hasRole('ADMIN') or @classService.isCurrentUserTeacherOfClass(#classId)")
    public ResponseEntity<ClassResponse> update(@RequestBody @Valid CreateClassRequest createClassRequest, @PathVariable Long classId) {
        return ResponseEntity.ok(Class2ClassResponse.INSTANCE.map(classService.update(createClassRequest, classId)));
    }

    @Operation(
            summary = "Delete class REST API",
            description = "Delete class by id")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @DeleteMapping("/{classId}")
    @PreAuthorize("hasRole('ADMIN') or @classService.isCurrentUserTeacherOfClass(#classId)")
    public ResponseEntity<Void> delete(@PathVariable Long classId) {
        classService.delete(classId);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Get class REST API",
            description = "Get class by id")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/{classId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable Long classId) {
        return ResponseEntity.ok(Class2ClassResponse.INSTANCE.map(classService.getById(classId)));
    }

    @Operation(
            summary = "Get classes REST API",
            description = "Get all classes")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ClassResponse>> getAllClasses(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Class> classPage = classService.getAllClasses(pageable);
        return ResponseEntity.ok(classPage.map(Class2ClassResponse.INSTANCE::map));
    }

    @Operation(
            summary = "Get classes REST API",
            description = "Get all classes by teacher")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/by-teacher")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<Page<ClassResponse>> getClasses(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size,
            @RequestParam(required = true) Long teacherId
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Class> classPage = classService.getClassesByTeacherId(teacherId, pageable);
        return ResponseEntity.ok(classPage.map(Class2ClassResponse.INSTANCE::map));
    }

    @Operation(
            summary = "Get classes REST API",
            description = "Get all classes by student")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/by-student")
    public ResponseEntity<Page<ClassResponse>> getClassesByStudent(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size,
            @RequestParam(required = true) Long studentId
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Class> classPage = studentClassService.findClassByStudent(studentId, pageable);
        return ResponseEntity.ok(classPage.map(Class2ClassResponse.INSTANCE::map));
    }
}
