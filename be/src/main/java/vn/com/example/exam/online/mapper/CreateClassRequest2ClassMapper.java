package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.request.CreateClassRequest;

@Mapper
public interface CreateClassRequest2ClassMapper extends DefaultMapper<CreateClassRequest, Class> {
    CreateClassRequest2ClassMapper INSTANCE = Mappers.getMapper(CreateClassRequest2ClassMapper.class);
}
