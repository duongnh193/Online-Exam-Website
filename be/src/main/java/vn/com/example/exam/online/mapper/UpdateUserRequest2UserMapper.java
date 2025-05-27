package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.UpdateUserRequest;

@Mapper(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UpdateUserRequest2UserMapper extends DefaultMapper<UpdateUserRequest, User> {
    UpdateUserRequest2UserMapper INSTANCE  = Mappers.getMapper(UpdateUserRequest2UserMapper.class);
}
