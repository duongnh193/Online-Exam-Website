package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.request.CreateExamRequest;

@Mapper
public interface CreateExam2ExamMapper extends DefaultMapper<CreateExamRequest, Exam> {
    CreateExam2ExamMapper INSTANCE = Mappers.getMapper(CreateExam2ExamMapper.class);
}
