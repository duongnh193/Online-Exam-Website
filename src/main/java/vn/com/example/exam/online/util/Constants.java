package vn.com.example.exam.online.util;

public class Constants {
    public static final String AUTHORIZATION = "Authorization";
    public static final String BEARER = "Bearer ";
    public static final String ROLE = "role";
    public static final String USER_AGENT = "User-Agent";
    public static final String USER_AGENT_DEFAULT = "Unknown User-Agent";
    public static final String SUBJECT_OTP_MAIL = "Your OTP Code";
    public static final String TEXT_MAIL = "Your OTP code is: ";
    public static final String OTP_FORMAT = "%04d";
    public static final String USER_NOT_FOUND_ID = "User with id: %s not found";
    public static final String USER_NOT_FOUND_MESSAGE = "User with username or email: %s not found";
    public static final String USER_EXIST_WITH_USERNAME = "User with username: %s already exists";
    public static final String USER_EXIST_WITH_EMAIL = "User with email: %s already exists";
    public static final String OTP_RETURN_TEXT = "OTP has been sent to ";
    public static final String OTP_INVALID = "Invalid or expired OTP";
    public static final int TIME_TO_DELETE_OTP = 5*60*1000;
    public static final String USERNAME = "username";
    public static final String EMAIL = "email";
    public static final String INVALID_PASSWORD = "Invalid Password";
    public static final String CLASS_NOT_FOUND_ID = "Class with id: %s not found";
    public static final String DEFAULT_PAGE = "0";
    public static final String DEFAULT_SIZE = "10";
    public static final String PASSWORD_NOT_MATCH = "Password does not match";
    public static final String NOT_USE_2FA = "User does not use 2FA";
    public static final String RESET_PASSWORD_SUCCESS = "Reset password successful";
}
