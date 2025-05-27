package vn.com.example.exam.online.mapper;

import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.request.CreateClassRequest;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-28T03:14:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class CreateClassRequest2ClassMapperImpl implements CreateClassRequest2ClassMapper {

    @Override
    public Class map(CreateClassRequest source) {
        if ( source == null ) {
            return null;
        }

        Class class1 = new Class();

        class1.setName( source.getName() );
        class1.setDescription( source.getDescription() );
        class1.setImage( source.getImage() );

        return class1;
    }

    @Override
    public void mapTo(CreateClassRequest source, Class target) {
        if ( source == null ) {
            return;
        }

        target.setName( source.getName() );
        target.setDescription( source.getDescription() );
        target.setImage( source.getImage() );
    }
}
