package vn.com.example.exam.online.mapper;

import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.request.CreateExamRequest;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-28T03:14:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class CreateExam2ExamMapperImpl implements CreateExam2ExamMapper {

    @Override
    public Exam map(CreateExamRequest source) {
        if ( source == null ) {
            return null;
        }

        Exam exam = new Exam();

        exam.setTitle( source.getTitle() );
        exam.setDuration( source.getDuration() );
        exam.setStartAt( source.getStartAt() );
        exam.setEndAt( source.getEndAt() );
        exam.setPassword( source.getPassword() );
        exam.setStatus( source.getStatus() );

        return exam;
    }

    @Override
    public void mapTo(CreateExamRequest source, Exam target) {
        if ( source == null ) {
            return;
        }

        target.setTitle( source.getTitle() );
        target.setDuration( source.getDuration() );
        target.setStartAt( source.getStartAt() );
        target.setEndAt( source.getEndAt() );
        target.setPassword( source.getPassword() );
        target.setStatus( source.getStatus() );
    }
}
