package vn.com.example.exam.online.util;

public class Constants {
    public static final String AUTHORIZATION = "Authorization";
    public static final String BEARER = "Bearer ";
    public static final String ROLE = "role";
    public static final String USER_AGENT = "User-Agent";
    public static final String USER_AGENT_DEFAULT = "Unknown User-Agent";
    public static final String SUBJECT_OTP_MAIL = "Your OTP Code";
    public static final String TEXT_MAIL = "Your OTP code is: ";
    public static final String OTP_FORMAT = "%06d";
    public static final String USER_NOT_FOUND_MESSAGE = "User with username or email: %s not found";
    public static final String USER_EXIST_WITH_USERNAME = "User with username: %s already exists";
    public static final String USER_EXIST_WITH_EMAIL = "User with email: %s already exists";
    public static final String OTP_RETURN_TEXT = "OTP has been sent to ";
    public static final String OTP_INVALID = "Invalid or expired OTP";
    public static final int TIME_TO_DELETE_OTP = 5*60*1000;
}
