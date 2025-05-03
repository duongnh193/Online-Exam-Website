package vn.com.example.exam.online.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import vn.com.example.exam.online.config.JwtTokenProvider;
import vn.com.example.exam.online.exception.UserExistException;
import vn.com.example.exam.online.exception.UserNotFoundException;
import vn.com.example.exam.online.mail.EmailService;
import vn.com.example.exam.online.mapper.SignupRequest2UserMapper;
import vn.com.example.exam.online.mapper.User2UserResponse;
import vn.com.example.exam.online.model.entity.LoginHistory;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.LoginRequest;
import vn.com.example.exam.online.model.request.ResetPasswordRequest;
import vn.com.example.exam.online.model.request.SignupRequest;
import vn.com.example.exam.online.model.response.JwtResponse;
import vn.com.example.exam.online.model.response.UserResponse;
import vn.com.example.exam.online.repository.LoginHistoryRepository;
import vn.com.example.exam.online.repository.UserRepository;
import vn.com.example.exam.online.util.Constants;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    private final Map<String, String> otpStore = new HashMap<>();

    public Object login(LoginRequest loginRequest, String userAgent) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsernameOrEmail(userDetails.getUsername(), userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException(Constants.USER_NOT_FOUND_MESSAGE.formatted(userDetails.getUsername())));

        if (user.isTwoFactor()) {
            String otp = emailService.generateOtp();
            otpStore.put(user.getEmail(), otp);
            emailService.sendOtpEmail(user.getEmail(), otp);

            new Thread(() -> {
                try {
                    Thread.sleep(Constants.TIME_TO_DELETE_OTP);
                    otpStore.remove(user.getEmail());
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();

            return Constants.OTP_RETURN_TEXT + user.getEmail();
        } else {
            String token = jwtTokenProvider.generateToken(authentication);

            LoginHistory loginHistory = new LoginHistory();
            loginHistory.setUser(user);
            loginHistory.setLoginTime(OffsetDateTime.now());
            loginHistory.setUserAgent(userAgent);
            loginHistoryRepository.save(loginHistory);

            return new JwtResponse(token, user.getId());
        }
    }

    public JwtResponse verifyOtp(LoginRequest loginRequest, String otp, String userAgent) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsernameOrEmail(userDetails.getUsername(), userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException(Constants.USER_NOT_FOUND_MESSAGE.formatted(userDetails.getUsername())));
        String storedOtp = otpStore.get(user.getEmail());
        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new IllegalArgumentException(Constants.OTP_INVALID);
        }

        String token = jwtTokenProvider.generateToken(authentication);

        LoginHistory loginHistory = new LoginHistory();
        loginHistory.setUser(user);
        loginHistory.setLoginTime(OffsetDateTime.now());
        loginHistory.setUserAgent(userAgent);
        loginHistoryRepository.save(loginHistory);

        otpStore.remove(user.getEmail());

        return new JwtResponse(token, user.getId());
    }

    public UserResponse registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new UserExistException(Constants.USER_EXIST_WITH_USERNAME.formatted(signUpRequest.getUsername()));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new UserExistException(Constants.USER_EXIST_WITH_EMAIL.formatted(signUpRequest.getEmail()));
        }
        User user = SignupRequest2UserMapper.INSTANCE.map(signUpRequest);
        user.setPasswordHash(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setCreateAt(OffsetDateTime.now());
        return User2UserResponse.INSTANCE.map(userRepository.save(user));
    }

    public String resendOtp(String usernameOrEmail) {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UserNotFoundException(Constants.USER_NOT_FOUND_MESSAGE.formatted(usernameOrEmail)));

        if (!user.isTwoFactor()) {
            throw new IllegalStateException(Constants.NOT_USE_2FA);
        }

        String otp = emailService.generateOtp();
        otpStore.put(user.getEmail(), otp);
        emailService.sendOtpEmail(user.getEmail(), otp);

        new Thread(() -> {
            try {
                Thread.sleep(Constants.TIME_TO_DELETE_OTP);
                otpStore.remove(user.getEmail());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();

        return Constants.OTP_RETURN_TEXT + user.getEmail();
    }

    public String resetPassword(String emailOrUsername) {
        User user = userRepository.findByUsernameOrEmail(emailOrUsername, emailOrUsername)
                .orElseThrow(() ->
                        new UserNotFoundException(Constants.USER_NOT_FOUND_MESSAGE.formatted(emailOrUsername)));
        String email = user.getEmail();
        String newPassword = generateRandomPassword();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        emailService.sendResetPasswordEmail(emailOrUsername, newPassword);

        return Constants.RESET_PASSWORD_SUCCESS + " " + email;
    }

    private String generateRandomPassword() {
        int length = 10;
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
