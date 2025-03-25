package vn.com.example.exam.online.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.com.example.exam.online.model.request.SignupRequest;
import vn.com.example.exam.online.model.request.UpdatePasswordRequest;
import vn.com.example.exam.online.model.request.UpdateUserRequest;
import vn.com.example.exam.online.model.response.UserResponse;
import vn.com.example.exam.online.service.UserService;

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
        return ResponseEntity.ok(userService.create(signupRequest));
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
        return ResponseEntity.ok(userService.update(updateUserRequest, id));
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
        return ResponseEntity.ok(userService.updatePassword(updatePasswordRequest, id));
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
        return ResponseEntity.ok(userService.update2FA(id, twoFA));
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
        return ResponseEntity.ok(userService.updateRole(id, role));
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
        return ResponseEntity.ok(userService.getUserById(id));
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
        return ResponseEntity.ok(userService.getUserByUsername(username));
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
        return ResponseEntity.ok(userService.getUserByEmail(email));
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
        return ResponseEntity.ok(userService.delete(id));
    }
}
