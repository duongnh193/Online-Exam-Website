package vn.com.example.exam.online.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.RoleEnum;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SignupRequest {
    @NotNull
    String username;
    @NotNull
    String password;
    @NotNull
    @Email
    String email;
    @NotNull
    String firstName;
    @NotNull
    String lastName;
    String image;
    @NotNull
    RoleEnum role;
}
