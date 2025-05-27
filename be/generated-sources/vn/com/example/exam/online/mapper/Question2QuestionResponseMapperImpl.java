package vn.com.example.exam.online.mapper;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.ChoiceDto;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.entity.Question;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.response.QuestionResponse;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-28T03:14:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class Question2QuestionResponseMapperImpl implements Question2QuestionResponseMapper {

    @Override
    public void mapTo(Question source, QuestionResponse target) {
        if ( source == null ) {
            return;
        }

        target.setId( source.getId() );
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

    @Override
    public QuestionResponse map(Question source) {
        if ( source == null ) {
            return null;
        }

        QuestionResponse questionResponse = new QuestionResponse();

        questionResponse.setExamId( sourceExamId( source ) );
        questionResponse.setCreatorId( sourceCreatorId( source ) );
        questionResponse.setId( source.getId() );
        questionResponse.setTitle( source.getTitle() );
        questionResponse.setType( source.getType() );
        List<ChoiceDto> list = source.getChoices();
        if ( list != null ) {
            questionResponse.setChoices( new ArrayList<ChoiceDto>( list ) );
        }
        questionResponse.setAnswer( source.getAnswer() );
        questionResponse.setImage( source.getImage() );

        return questionResponse;
    }

    private Long sourceExamId(Question question) {
        Exam exam = question.getExam();
        if ( exam == null ) {
            return null;
        }
        return exam.getId();
    }

    private Long sourceCreatorId(Question question) {
        User creator = question.getCreator();
        if ( creator == null ) {
            return null;
        }
        return creator.getId();
    }
}
