package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.Question;
import vn.com.example.exam.online.model.request.CreateQuestionRequest;

@Mapper
public interface CreateQuestionRequest2QuestionMapper extends DefaultMapper<CreateQuestionRequest, Question> {
    CreateQuestionRequest2QuestionMapper INSTANCE = Mappers.getMapper(CreateQuestionRequest2QuestionMapper.class);
}
