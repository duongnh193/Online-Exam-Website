package vn.com.example.exam.online.mapper;

import javax.annotation.processing.Generated;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.response.UserResponse;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-26T00:07:27+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 17.0.15 (Ubuntu)"
)
public class User2UserResponseImpl implements User2UserResponse {

    @Override
    public UserResponse map(User source) {
        if ( source == null ) {
            return null;
        }

        UserResponse userResponse = new UserResponse();

        userResponse.setId( source.getId() );
        userResponse.setUsername( source.getUsername() );
        userResponse.setEmail( source.getEmail() );
        userResponse.setFirstName( source.getFirstName() );
        userResponse.setLastName( source.getLastName() );
        userResponse.setCreateAt( source.getCreateAt() );
        userResponse.setUpdateAt( source.getUpdateAt() );
        userResponse.setTwoFactor( source.isTwoFactor() );
        userResponse.setRole( source.getRole() );

        return userResponse;
    }

    @Override
    public void mapTo(User source, UserResponse target) {
        if ( source == null ) {
            return;
        }

        target.setId( source.getId() );
        target.setUsername( source.getUsername() );
        target.setEmail( source.getEmail() );
        target.setFirstName( source.getFirstName() );
        target.setLastName( source.getLastName() );
        target.setCreateAt( source.getCreateAt() );
        target.setUpdateAt( source.getUpdateAt() );
        target.setTwoFactor( source.isTwoFactor() );
        target.setRole( source.getRole() );
    }
}
