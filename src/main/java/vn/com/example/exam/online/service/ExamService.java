package vn.com.example.exam.online.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.com.example.exam.online.exception.ExamNotFoundException;
import vn.com.example.exam.online.mapper.CreateExam2ExamMapper;
import vn.com.example.exam.online.mapper.Exam2ExamResponseMapper;
import vn.com.example.exam.online.model.entity.Class;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.CreateExamRequest;
import vn.com.example.exam.online.model.response.ExamResponse;
import vn.com.example.exam.online.repository.ExamRepository;
import vn.com.example.exam.online.util.Constants;

@Service
@RequiredArgsConstructor
public class ExamService {
    private final ExamRepository examRepository;
    private final UserService userService;
    private final ClassService classService;

    public ExamResponse create(CreateExamRequest createExamRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User creator = userService.getUserByUsername(username);
        Class clazz = classService.getById(createExamRequest.getClassId());
        Exam exam = CreateExam2ExamMapper.INSTANCE.map(createExamRequest);
        exam.setCreator(creator).setClassEntity(clazz);
        return Exam2ExamResponseMapper.INSTANCE.map(examRepository.save(exam));
    }

    public ExamResponse update(CreateExamRequest createExamRequest, Long examId) {
        Exam exam = getById(examId);
        CreateExam2ExamMapper.INSTANCE.mapTo(createExamRequest, exam);
        return Exam2ExamResponseMapper.INSTANCE.map(examRepository.save(exam));
    }

    public ExamResponse getExamById(Long examId) {
        return Exam2ExamResponseMapper.INSTANCE.map(getById(examId));
    }

    public Page<ExamResponse> getExamsByClass(Long classId, Pageable pageable) {
        return examRepository.findByClassEntityId(classId, pageable).map(Exam2ExamResponseMapper.INSTANCE::map);
    }

    private Exam getById(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new ExamNotFoundException(Constants.EXAM_NOT_FOUND_ID.formatted(examId)));
    }

    public void delete(Long examId) {
        Exam exam = getById(examId);
        examRepository.delete(exam);
    }
}
