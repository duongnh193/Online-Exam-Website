package vn.com.example.exam.online.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.com.example.exam.online.model.request.LoginRequest;
import vn.com.example.exam.online.model.request.ResetPasswordRequest;
import vn.com.example.exam.online.model.request.SignupRequest;
import vn.com.example.exam.online.model.response.JwtResponse;
import vn.com.example.exam.online.model.response.UserResponse;
import vn.com.example.exam.online.service.AuthService;
import vn.com.example.exam.online.util.Constants;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @Operation(
            summary = "Login REST API",
            description = "Login and return JWT or request OTP if 2FA is enabled")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest loginRequest, HttpServletRequest request) {
        String userAgent = request.getHeader(Constants.USER_AGENT) != null
                ? request.getHeader(Constants.USER_AGENT) : Constants.USER_AGENT_DEFAULT;
        Object result = authService.login(loginRequest, userAgent);

        if (result instanceof String) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.ok((JwtResponse) result);
        }
    }

    @Operation(
            summary = "Verify OTP REST API",
            description = "Verify OTP and return JWT token")
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK")
    @PostMapping("/verify-otp")
    public ResponseEntity<JwtResponse> verifyOtp(
            @RequestBody @Valid LoginRequest loginRequest,
            @RequestParam String otp,
            HttpServletRequest request) {
        String userAgent = request.getHeader(Constants.USER_AGENT) != null
                ? request.getHeader(Constants.USER_AGENT) : Constants.USER_AGENT_DEFAULT;
        return ResponseEntity.ok(authService.verifyOtp(loginRequest, otp, userAgent));
    }

    @Operation(
            summary = "Signup REST API",
            description = "Signup REST API is used to register a new user"
    )
    @ApiResponse(
            responseCode = "200",
            description = "HTTP Status 200 OK"
    )
    @PostMapping("/signup")
    public ResponseEntity<UserResponse> registerUser(@RequestBody @Valid SignupRequest signupRequest) {
        return ResponseEntity.ok(authService.registerUser(signupRequest));
    }

    @Operation(
            summary = "Resend OTP REST API",
            description = "Resend OTP for users who enabled 2FA"
    )
    @ApiResponse(
            responseCode = "200",
            description = "OTP resent to user's email"
    )
    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestParam String usernameOrEmail) {
        return ResponseEntity.ok(authService.resendOtp(usernameOrEmail));
    }

    @Operation(
            summary = "Reset Password REST API",
            description = "Reset password using email, OTP, and new password"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Password reset successful"
    )
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody @Valid ResetPasswordRequest resetPasswordRequest) {
        return ResponseEntity.ok(authService.resetPassword(resetPasswordRequest));
    }
}
