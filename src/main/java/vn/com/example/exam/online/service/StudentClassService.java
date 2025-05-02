package vn.com.example.exam.online.service;

import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.com.example.exam.online.exception.UserNotFoundException;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.entity.StudentClass;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.repository.ClassRepository;
import vn.com.example.exam.online.repository.StudentClassRepository;
import vn.com.example.exam.online.repository.UserRepository;
import vn.com.example.exam.online.util.Constants;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentClassService {
    private final StudentClassRepository studentClassRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;

    public int importStudentsFromCsv(MultipartFile file, Long classId) {
        int successCount = 0;

        Optional<Class> classOpt = classRepository.findById(classId);
        if (classOpt.isEmpty()) {
            throw new IllegalArgumentException(Constants.CLASS_NOT_FOUND.formatted(classId));
        }
        Class clazz = classOpt.get();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String[] line;
            reader.readNext(); // Bỏ header

            while ((line = reader.readNext()) != null) {
                if (line.length < 2) continue; // tránh lỗi khi dòng không đủ cột

                String email = line[1].trim(); // Chỉ lấy cột email

                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    StudentClass sc = new StudentClass()
                            .setStudent(user)
                            .setClassEntity(clazz);
                    sc.setId();
                    if (studentClassRepository.existsById(sc.getId())) {
                        continue; //
                    }
                    studentClassRepository.save(sc);
                    successCount++;
                }
            }
        } catch (Exception e) {
            e.printStackTrace(); // hoặc log lỗi tùy context
        }

        return successCount;
    }

    public boolean addStudentToClass(Long classId, String usernameOrEmail) {
        Optional<Class> classOpt = classRepository.findById(classId);
        if (classOpt.isEmpty()) {
            throw new IllegalArgumentException(Constants.CLASS_NOT_FOUND.formatted(classId));
        }
        Class clazz = classOpt.get();

        Optional<User> userOpt = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();

        StudentClass sc = new StudentClass()
                .setStudent(user)
                .setClassEntity(clazz);
        sc.setId();

        if (studentClassRepository.existsById(sc.getId())) {
            return false;
        }

        studentClassRepository.save(sc);
        return true;
    }

    public boolean removeStudentFromClass(Long classId, String usernameOrEmail) {
        Optional<Class> classOpt = classRepository.findById(classId);
        if (classOpt.isEmpty()) {
            return false;
        }

        Class clazz = classOpt.get();
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if (userOpt.isEmpty()) {
            return false;
        }

        User student = userOpt.get();
        Optional<StudentClass> studentClassOpt = studentClassRepository.findById(student.getId().toString() + classId);

        if (studentClassOpt.isPresent()) {
            studentClassRepository.delete(studentClassOpt.get());
            return true;
        }

        return false;
    }
}
