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
import vn.com.example.exam.online.mapper.User2UserResponse;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.request.SignupRequest;
import vn.com.example.exam.online.model.request.UpdatePasswordRequest;
import vn.com.example.exam.online.model.request.UpdateUserRequest;
import vn.com.example.exam.online.model.response.ClassResponse;
import vn.com.example.exam.online.model.response.UserResponse;
import vn.com.example.exam.online.service.UserService;
import vn.com.example.exam.online.util.Constants;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @Operation(
            summary = "Create REST API",
            description = "Create user")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> create(@RequestBody @Valid SignupRequest signupRequest) {
        return ResponseEntity.ok(User2UserResponse.INSTANCE.map(userService.create(signupRequest)));
    }

    @Operation(
            summary = "Update REST API",
            description = "Update user")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isAccountOwner(#id)")
    public ResponseEntity<UserResponse> update(@RequestBody @Valid UpdateUserRequest updateUserRequest, @PathVariable Long id) {
        return ResponseEntity.ok(User2UserResponse.INSTANCE.map(userService.update(updateUserRequest, id)));
    }

    @Operation(
            summary = "Update password REST API",
            description = "Update password user")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PutMapping("/{id}/password")
    @PreAuthorize("isAuthenticated() and @userService.isAccountOwner(#id)")
    public ResponseEntity<UserResponse> updatePassword(@RequestBody @Valid UpdatePasswordRequest updatePasswordRequest, @PathVariable Long id) {
        return ResponseEntity.ok(User2UserResponse.INSTANCE.map(userService.updatePassword(updatePasswordRequest, id)));
    }

    @Operation(
            summary = "Update 2fa REST API",
            description = "Update 2fa user")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PutMapping("/{id}/2fa")
    @PreAuthorize("isAuthenticated() and @userService.isAccountOwner(#id)")
    public ResponseEntity<UserResponse> update2FA(@RequestParam boolean twoFA, @PathVariable Long id) {
        return ResponseEntity.ok(User2UserResponse.INSTANCE.map(userService.update2FA(id, twoFA)));
    }

    @Operation(
            summary = "Update role REST API",
            description = "Update role user")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateRole(@RequestParam String role, @PathVariable Long id) {
        return ResponseEntity.ok(User2UserResponse.INSTANCE.map(userService.updateRole(id, role)));
    }

    @Operation(
            summary = "Get user REST API",
            description = "Get user by id")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isAccountOwner(#id)")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(User2UserResponse.INSTANCE.map(userService.getUserById(id)));
    }

    @Operation(
            summary = "Get user REST API",
            description = "Get user by username")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/by-username")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserByUsername(@RequestParam String username) {
        return ResponseEntity.ok(User2UserResponse.INSTANCE.map(userService.getUserByUsername(username)));
    }

    @Operation(
            summary = "Get user REST API",
            description = "Get user by email")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/by-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam String email) {
        return ResponseEntity.ok(User2UserResponse.INSTANCE.map(userService.getUserByEmail(email)));
    }

    @Operation(
            summary = "Delete user REST API",
            description = "Delete user by id")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> delete(@PathVariable Long id) {
        return ResponseEntity.ok(User2UserResponse.INSTANCE.map(userService.delete(id)));
    }

    @Operation(
            summary = "Get users REST API",
            description = "Get all users")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size,
            @RequestParam(required = false) Sort sort
    ) {
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(userService.getUsers(pageable));
    }

    @Operation(
            summary = "Get users REST API",
            description = "Get all users have role ADMIN")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getUsersAdmin(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size,
            @RequestParam(required = false) Sort sort
    ) {
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(userService.getUsersAdmin(pageable));
    }

    @Operation(
            summary = "Get users REST API",
            description = "Get all users have role LECTURER")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/lecturer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getUsersLecturer(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size,
            @RequestParam(required = false) Sort sort
    ) {
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(userService.getUsersLecturer(pageable));
    }

    @Operation(
            summary = "Get users REST API",
            description = "Get all users have role ADMIN")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @GetMapping("/student")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getUsersStudent(
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size,
            @RequestParam(required = false) Sort sort
    ) {
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(userService.getUsersStudent(pageable));
    }
}
