package vn.com.example.exam.online.mapper;

import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.response.ClassResponse;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-28T03:14:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class Class2ClassResponseImpl implements Class2ClassResponse {

    @Override
    public void mapTo(Class source, ClassResponse target) {
        if ( source == null ) {
            return;
        }

        target.setId( source.getId() );
        target.setName( source.getName() );
        target.setDescription( source.getDescription() );
        target.setImage( source.getImage() );
        target.setCreateAt( source.getCreateAt() );
    }

    @Override
    public ClassResponse map(Class source) {
        if ( source == null ) {
            return null;
        }

        ClassResponse classResponse = new ClassResponse();

        classResponse.setTeacherId( sourceTeacherId( source ) );
        classResponse.setExamIds( mapExamsToIds( source.getExams() ) );
        classResponse.setId( source.getId() );
        classResponse.setName( source.getName() );
        classResponse.setDescription( source.getDescription() );
        classResponse.setImage( source.getImage() );
        classResponse.setCreateAt( source.getCreateAt() );

        return classResponse;
    }

    private Long sourceTeacherId(Class class1) {
        User teacher = class1.getTeacher();
        if ( teacher == null ) {
            return null;
        }
        return teacher.getId();
    }
}
