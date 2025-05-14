package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.StudentExam;
import vn.com.example.exam.online.model.response.StudentExamResultResponse;

@Mapper
public interface StudentExam2StudentExamResultResponseMapper extends DefaultMapper<StudentExam, StudentExamResultResponse> {
    StudentExam2StudentExamResultResponseMapper INSTANCE = Mappers.getMapper(StudentExam2StudentExamResultResponseMapper.class);
}
