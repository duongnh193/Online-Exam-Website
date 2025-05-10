package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.response.ExamResponse;

@Mapper
public interface Exam2ExamResponseMapper extends DefaultMapper<Exam, ExamResponse> {
    Exam2ExamResponseMapper INSTANCE = Mappers.getMapper(Exam2ExamResponseMapper.class);

    @Override
    @Mapping(source = "classEntity.id", target = "classId")
    @Mapping(source = "creator.id", target = "userId")
    @Mapping(expression = "java(source.getQuestions().size())", target = "totalQuestions")
    ExamResponse map(Exam source);
}
