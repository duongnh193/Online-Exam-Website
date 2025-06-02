package vn.com.example.exam.online.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.com.example.exam.online.exception.ClassNotFoundException;
import vn.com.example.exam.online.mapper.CreateClassRequest2ClassMapper;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.CreateClassRequest;
import vn.com.example.exam.online.model.response.ClassResponse;
import vn.com.example.exam.online.repository.ClassRepository;
import vn.com.example.exam.online.repository.UserRepository;
import vn.com.example.exam.online.util.Constants;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ClassService {
    private final ClassRepository classRepository;
    private final UserService userService;

    public Class create(CreateClassRequest createClassRequest) {
        User teacher = userService.getUserById(createClassRequest.getTeacherId());
        Class classEntity = CreateClassRequest2ClassMapper.INSTANCE.map(createClassRequest);
        classEntity.setCreateAt(OffsetDateTime.now())
                .setTeacher(teacher);
        return classRepository.save(classEntity);
    }

    public Class update(CreateClassRequest createClassRequest, Long classId) {
        User teacher = userService.getUserById(createClassRequest.getTeacherId());
        Class classEntity = getById(classId);
        classEntity.setTeacher(teacher);
        CreateClassRequest2ClassMapper.INSTANCE.mapTo(createClassRequest, classEntity);
        return classRepository.save(classEntity);
    }

    public Class getById(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new ClassNotFoundException(Constants.CLASS_NOT_FOUND_ID.formatted(classId)));
    }

    public Page<Class> getClassesByTeacherId(Long teacherId, Pageable pageable) {
        return classRepository.findByTeacherId(teacherId, pageable);
    }

    public Page<Class> getAllClasses(Pageable pageable) {
        return classRepository.findAll(pageable);
    }

    public void delete(Long classId) {
        classRepository.deleteById(classId);
    }

    public boolean isCurrentUserTeacherOfClass(Long classId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        return classRepository.findById(classId)
                .map(classEntity -> classEntity.getTeacher().getUsername().equals(currentUsername))
                .orElse(false);
    }
}
