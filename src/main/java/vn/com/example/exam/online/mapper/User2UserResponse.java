package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.response.UserResponse;

@Mapper
public interface User2UserResponse extends DefaultMapper<User, UserResponse> {
    User2UserResponse INSTANCE = Mappers.getMapper(User2UserResponse.class);
}
