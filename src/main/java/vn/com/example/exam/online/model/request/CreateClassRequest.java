package vn.com.example.exam.online.model.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateClassRequest {
    @NotNull
    @Size(max = 255)
    @Pattern(regexp = "^[\\p{L}\\d\\s]+$",
            message = "Only letters and spaces are allowed, special characters are not permitted.")
    String name;
    @Size(max = 255)
    @Pattern(regexp = "^[\\p{L}\\d\\s]+$",
            message = "Only letters and spaces are allowed, special characters are not permitted.")
    String description;
    Long teacherId;
    String image;
}
