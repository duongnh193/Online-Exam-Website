package vn.com.example.exam.online.model.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassResponse {
    Long id;
    String name;
    String description;
    String image;
    OffsetDateTime createAt;
    Long teacherId;
    List<Long> examIds;
}
