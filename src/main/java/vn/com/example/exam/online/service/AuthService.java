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
import vn.com.example.exam.online.model.request.SignupRequest;
import vn.com.example.exam.online.model.response.JwtResponse;
import vn.com.example.exam.online.model.response.UserResponse;
import vn.com.example.exam.online.repository.LoginHistoryRepository;
import vn.com.example.exam.online.repository.UserRepository;
import vn.com.example.exam.online.util.Constants;

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

            return new JwtResponse(token);
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

        return new JwtResponse(token);
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
}
