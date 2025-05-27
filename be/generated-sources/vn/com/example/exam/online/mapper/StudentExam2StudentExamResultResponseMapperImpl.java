package vn.com.example.exam.online.mapper;

import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.entity.StudentExam;
import vn.com.example.exam.online.model.response.StudentExamResultResponse;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-26T00:07:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class StudentExam2StudentExamResultResponseMapperImpl implements StudentExam2StudentExamResultResponseMapper {

    @Override
    public StudentExamResultResponse map(StudentExam source) {
        if ( source == null ) {
            return null;
        }

        StudentExamResultResponse studentExamResultResponse = new StudentExamResultResponse();

        studentExamResultResponse.setId( source.getId() );
        studentExamResultResponse.setScore( source.getScore() );
        studentExamResultResponse.setStartAt( source.getStartAt() );
        studentExamResultResponse.setFinishAt( source.getFinishAt() );
        studentExamResultResponse.setTime( source.getTime() );
        studentExamResultResponse.setStatus( source.getStatus() );

        return studentExamResultResponse;
    }

    @Override
    public void mapTo(StudentExam source, StudentExamResultResponse target) {
        if ( source == null ) {
            return;
        }

        target.setId( source.getId() );
        target.setScore( source.getScore() );
        target.setStartAt( source.getStartAt() );
        target.setFinishAt( source.getFinishAt() );
        target.setTime( source.getTime() );
        target.setStatus( source.getStatus() );
    }
}
