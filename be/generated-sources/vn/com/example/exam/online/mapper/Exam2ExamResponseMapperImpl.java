package vn.com.example.exam.online.mapper;

import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.response.ExamResponse;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-26T00:07:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class Exam2ExamResponseMapperImpl implements Exam2ExamResponseMapper {

    @Override
    public void mapTo(Exam source, ExamResponse target) {
        if ( source == null ) {
            return;
        }

        target.setId( source.getId() );
        target.setTitle( source.getTitle() );
        target.setDuration( source.getDuration() );
        target.setStartAt( source.getStartAt() );
        target.setEndAt( source.getEndAt() );
        target.setPassword( source.getPassword() );
        target.setStatus( source.getStatus() );
    }

    @Override
    public ExamResponse map(Exam source) {
        if ( source == null ) {
            return null;
        }

        ExamResponse examResponse = new ExamResponse();

        examResponse.setClassId( sourceClassEntityId( source ) );
        examResponse.setUserId( sourceCreatorId( source ) );
        examResponse.setTeacherId( sourceTeacherId( source ) );
        examResponse.setId( source.getId() );
        examResponse.setTitle( source.getTitle() );
        examResponse.setDuration( source.getDuration() );
        examResponse.setStartAt( source.getStartAt() );
        examResponse.setEndAt( source.getEndAt() );
        examResponse.setPassword( source.getPassword() );
        examResponse.setStatus( source.getStatus() );

        examResponse.setTotalQuestions( source.getQuestions().size() );

        return examResponse;
    }

    private Long sourceClassEntityId(Exam exam) {
        Class classEntity = exam.getClassEntity();
        if ( classEntity == null ) {
            return null;
        }
        return classEntity.getId();
    }

    private Long sourceCreatorId(Exam exam) {
        User creator = exam.getCreator();
        if ( creator == null ) {
            return null;
        }
        return creator.getId();
    }

    private Long sourceTeacherId(Exam exam) {
        User teacher = exam.getTeacher();
        if ( teacher == null ) {
            return null;
        }
        return teacher.getId();
    }
}
