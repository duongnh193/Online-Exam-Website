package vn.com.example.exam.online.mapper;

import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.UpdateUserRequest;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-28T03:14:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class UpdateUserRequest2UserMapperImpl implements UpdateUserRequest2UserMapper {

    @Override
    public User map(UpdateUserRequest source) {
        if ( source == null ) {
            return null;
        }

        User user = new User();

        user.setUsername( source.getUsername() );
        user.setEmail( source.getEmail() );
        user.setFirstName( source.getFirstName() );
        user.setLastName( source.getLastName() );
        user.setImage( source.getImage() );

        return user;
    }

    @Override
    public void mapTo(UpdateUserRequest source, User target) {
        if ( source == null ) {
            return;
        }

        if ( source.getUsername() != null ) {
            target.setUsername( source.getUsername() );
        }
        if ( source.getEmail() != null ) {
            target.setEmail( source.getEmail() );
        }
        if ( source.getFirstName() != null ) {
            target.setFirstName( source.getFirstName() );
        }
        if ( source.getLastName() != null ) {
            target.setLastName( source.getLastName() );
        }
        if ( source.getImage() != null ) {
            target.setImage( source.getImage() );
        }
    }
}
