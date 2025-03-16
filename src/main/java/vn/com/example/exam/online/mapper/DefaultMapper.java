package vn.com.example.exam.online.mapper;

import org.mapstruct.MapperConfig;
import org.mapstruct.MappingTarget;

@MapperConfig
public interface DefaultMapper<T, R> {
    R map(T source);

    void mapTo(T source, @MappingTarget R target);
}
