package vn.com.example.exam.online.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.RoleEnum;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SignupRequest {
    @NotNull
    @Size(max = 50)
    @Pattern(regexp = "^[a-zA-Z]+$",
            message = "Username must contain only English letters without special characters or spaces.")
    String username;
    @NotNull
    String password;
    @NotNull
    @Email
    String email;
    @NotNull
    @Size(max = 50)
    @Pattern(regexp = "^[\\p{L}\\s]+$",
            message = "Only letters and spaces are allowed, special characters are not permitted.")
    String firstName;
    @NotNull
    @Size(max = 50)
    @Pattern(regexp = "^[\\p{L}\\s]+$",
            message = "Only letters and spaces are allowed, special characters are not permitted.")
    String lastName;
    String image;
    @NotNull
    RoleEnum role;
}
