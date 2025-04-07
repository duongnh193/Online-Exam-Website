package vn.com.example.exam.online.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.response.ClassResponse;

import java.util.List;
import java.util.stream.Collectors;

@Mapper
public interface Class2ClassResponse extends DefaultMapper<Class, ClassResponse> {
    Class2ClassResponse INSTANCE = Mappers.getMapper(Class2ClassResponse.class);

    @Override
    @Mapping(source = "teacher.id", target = "teacherId")
    @Mapping(source = "exams", target = "examIds", qualifiedByName = "mapExamsToIds")
    ClassResponse map(Class source);

    @Named("mapExamsToIds")
    default List<Long> mapExamsToIds(List<Exam> exams) {
        if (exams == null) return null;
        return exams.stream()
                .map(Exam::getId)
                .collect(Collectors.toList());
    }
}
