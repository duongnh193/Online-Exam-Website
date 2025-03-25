package vn.com.example.exam.online.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.com.example.exam.online.exception.InvalidPasswordException;
import vn.com.example.exam.online.exception.UserExistException;
import vn.com.example.exam.online.exception.UserNotFoundException;
import vn.com.example.exam.online.mapper.SignupRequest2UserMapper;
import vn.com.example.exam.online.mapper.UpdateUserRequest2UserMapper;
import vn.com.example.exam.online.mapper.User2UserResponse;
import vn.com.example.exam.online.model.RoleEnum;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.SignupRequest;
import vn.com.example.exam.online.model.request.UpdatePasswordRequest;
import vn.com.example.exam.online.model.request.UpdateUserRequest;
import vn.com.example.exam.online.model.response.UserResponse;
import vn.com.example.exam.online.repository.UserRepository;
import vn.com.example.exam.online.util.Constants;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse create(SignupRequest signupRequest) {
        checkUsername(signupRequest.getUsername());
        checkEmail(signupRequest.getEmail());
        User user = SignupRequest2UserMapper.INSTANCE.map(signupRequest);
        user.setCreateAt(OffsetDateTime.now());
        user.setPasswordHash(passwordEncoder.encode(signupRequest.getPassword()));
        return User2UserResponse.INSTANCE.map(userRepository.save(user));
    }

    public UserResponse update(UpdateUserRequest updateUserRequest,  Long id) {
        try {
            User user = findUserById(id);
            UpdateUserRequest2UserMapper.INSTANCE.mapTo(updateUserRequest, user);
            user.setUpdateAt(OffsetDateTime.now());
            return User2UserResponse.INSTANCE.map(userRepository.save(user));
        } catch (DataIntegrityViolationException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof ConstraintViolationException constraintEx) {
                String constraintName = constraintEx.getConstraintName();
                if (constraintName.contains(Constants.USERNAME)) {
                    throw new UserExistException(Constants.USER_EXIST_WITH_USERNAME
                            .formatted(updateUserRequest.getUsername()));
                } else if (constraintName.contains(Constants.EMAIL)) {
                    throw new UserExistException(Constants.USER_EXIST_WITH_EMAIL
                            .formatted(updateUserRequest.getEmail()));
                }
            }
            throw ex;
        }
    }

    private void checkUsername(String username) {
        if (userRepository.existsByUsername(username)) {
            throw new UserExistException(Constants.USER_EXIST_WITH_USERNAME.formatted(username));
        }
    }

    private void checkEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new UserExistException(Constants.USER_EXIST_WITH_EMAIL.formatted(email));
        }
    }

    private User findUserById(Long id) {
        return userRepository.findById(id).orElseThrow(
                () -> new UserNotFoundException(Constants.USER_NOT_FOUND_ID.formatted(id))
        );
    }

    public UserResponse updatePassword(UpdatePasswordRequest updatePasswordRequest, Long id) {
        User user = findUserById(id);
        if (!passwordEncoder.encode(updatePasswordRequest.getCurrentPassword()).equals(user.getPasswordHash())) {
            throw new InvalidPasswordException(Constants.INVALID_PASSWORD);
        }
        user.setPasswordHash(passwordEncoder.encode(updatePasswordRequest.getNewPassword()));
        user.setUpdateAt(OffsetDateTime.now());
        return User2UserResponse.INSTANCE.map(userRepository.save(user));
    }

    public UserResponse update2FA(Long id, boolean twoFactor) {
        User user = findUserById(id);
        user.setTwoFactor(twoFactor);
        user.setUpdateAt(OffsetDateTime.now());
        return User2UserResponse.INSTANCE.map(userRepository.save(user));
    }

    public UserResponse updateRole(Long id, String role) {
        User user = findUserById(id);
        user.setRole(RoleEnum.valueOf(role));
        user.setUpdateAt(OffsetDateTime.now());
        return User2UserResponse.INSTANCE.map(userRepository.save(user));
    }

    public UserResponse getUserById(Long id) {
        return User2UserResponse.INSTANCE.map(findUserById(id));
    }

    public UserResponse getUserByUsername(String username) {
        return User2UserResponse.INSTANCE.map(userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(Constants.USER_NOT_FOUND_MESSAGE.formatted(username))));
    }

    public UserResponse getUserByEmail(String email) {
        return User2UserResponse.INSTANCE.map(userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(Constants.USER_NOT_FOUND_MESSAGE.formatted(email))));
    }

    public UserResponse delete(Long id) {
        User user = findUserById(id);
        userRepository.delete(user);
        return User2UserResponse.INSTANCE.map(user);
    }

    public boolean isAccountOwner(Long userId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findById(userId)
                .map(account -> account.getUsername().equals(currentUsername))
                .orElse(false);
    }
}
