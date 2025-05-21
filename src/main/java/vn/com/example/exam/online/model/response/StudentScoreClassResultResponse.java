package vn.com.example.exam.online.model.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import vn.com.example.exam.online.model.ClassResultDto;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentScoreClassResultResponse {
    Long studentId;
    String studentName;
    List<ClassResultDto> classResults;
}
