package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.Question;
import vn.com.example.exam.online.model.response.QuestionResponse;

@Mapper
public interface Question2QuestionResponseMapper extends DefaultMapper<Question, QuestionResponse> {
    Question2QuestionResponseMapper INSTANCE = Mappers.getMapper(Question2QuestionResponseMapper.class);

    @Override
    @Mapping(source = "exam.id", target = "examId")
    @Mapping(source = "creator.id", target = "creatorId")
    QuestionResponse map(Question source);
}
