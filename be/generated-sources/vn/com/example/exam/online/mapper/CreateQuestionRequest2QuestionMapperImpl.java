package vn.com.example.exam.online.mapper;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.ChoiceDto;
import vn.com.example.exam.online.model.entity.Question;
import vn.com.example.exam.online.model.request.CreateQuestionRequest;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-26T00:07:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class CreateQuestionRequest2QuestionMapperImpl implements CreateQuestionRequest2QuestionMapper {

    @Override
    public Question map(CreateQuestionRequest source) {
        if ( source == null ) {
            return null;
        }

        Question question = new Question();

        question.setTitle( source.getTitle() );
        question.setType( source.getType() );
        List<ChoiceDto> list = source.getChoices();
        if ( list != null ) {
            question.setChoices( new ArrayList<ChoiceDto>( list ) );
        }
        question.setAnswer( source.getAnswer() );
        question.setImage( source.getImage() );

        return question;
    }

    @Override
    public void mapTo(CreateQuestionRequest source, Question target) {
        if ( source == null ) {
            return;
        }

        target.setTitle( source.getTitle() );
        target.setType( source.getType() );
        if ( target.getChoices() != null ) {
            List<ChoiceDto> list = source.getChoices();
            if ( list != null ) {
                target.getChoices().clear();
                target.getChoices().addAll( list );
            }
            else {
                target.setChoices( null );
            }
        }
        else {
            List<ChoiceDto> list = source.getChoices();
            if ( list != null ) {
                target.setChoices( new ArrayList<ChoiceDto>( list ) );
            }
        }
        target.setAnswer( source.getAnswer() );
        target.setImage( source.getImage() );
    }
}
