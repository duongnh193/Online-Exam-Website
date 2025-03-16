package vn.com.example.exam.online.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import vn.com.example.exam.online.util.Constants;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(Constants.SUBJECT_OTP_MAIL);
        message.setText(Constants.TEXT_MAIL + otpCode);
        mailSender.send(message);
    }

    public String generateOtp() {
        return String.format(Constants.OTP_FORMAT, new Random().nextInt(1000000));
    }
}

