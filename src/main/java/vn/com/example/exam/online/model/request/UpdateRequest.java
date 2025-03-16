package vn.com.example.exam.online.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateRequest {
    @NotNull(message = "Username cannot be null")
    @Size(max = 50)
    String username;

    @NotNull(message = "Email cannot be null")
    @Email(message = "Invalid email format")
    @Size(max = 100)
    String email;
}
