package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.SignupRequest;

@Mapper
public interface SignupRequest2UserMapper extends DefaultMapper<SignupRequest, User> {
    SignupRequest2UserMapper INSTANCE = Mappers.getMapper(SignupRequest2UserMapper.class);
}
