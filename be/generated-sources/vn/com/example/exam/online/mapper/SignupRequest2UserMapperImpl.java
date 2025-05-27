package vn.com.example.exam.online.mapper;

import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.SignupRequest;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-26T00:07:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class SignupRequest2UserMapperImpl implements SignupRequest2UserMapper {

    @Override
    public User map(SignupRequest source) {
        if ( source == null ) {
            return null;
        }

        User user = new User();

        user.setUsername( source.getUsername() );
        user.setEmail( source.getEmail() );
        user.setFirstName( source.getFirstName() );
        user.setLastName( source.getLastName() );
        user.setImage( source.getImage() );
        user.setRole( source.getRole() );

        return user;
    }

    @Override
    public void mapTo(SignupRequest source, User target) {
        if ( source == null ) {
            return;
        }

        target.setUsername( source.getUsername() );
        target.setEmail( source.getEmail() );
        target.setFirstName( source.getFirstName() );
        target.setLastName( source.getLastName() );
        target.setImage( source.getImage() );
        target.setRole( source.getRole() );
    }
}
