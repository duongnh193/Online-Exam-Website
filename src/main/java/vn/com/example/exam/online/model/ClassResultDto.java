package vn.com.example.exam.online.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassResultDto {
    Long classId;
    Double averageScore;
    Double averageScoreIn10;
    Double averageScoreIn4;
}
