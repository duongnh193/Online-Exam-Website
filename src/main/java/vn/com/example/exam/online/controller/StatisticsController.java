package vn.com.example.exam.online.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.com.example.exam.online.model.RoleEnum;
import vn.com.example.exam.online.model.response.ExamScoreStatisticsResponse;
import vn.com.example.exam.online.model.response.StudentExamScoreResponse;
import vn.com.example.exam.online.model.response.StudentScoreClassResultResponse;
import vn.com.example.exam.online.service.StatisticsService;
import vn.com.example.exam.online.util.Constants;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    private final StatisticsService statisticsService;


    @GetMapping("/total-classes")
    public Long getTotalClasses() {
        return statisticsService.getTotalClasses();
    }

    @GetMapping("/total-exams/{classId}")
    public Long getTotalExamsInClass(@PathVariable Long classId) {
        return statisticsService.getTotalExamsInClass(classId);
    }

    @GetMapping("/total-exam")
    public Long getTotalExam() {
        return statisticsService.getTotalExams();
    }

    @GetMapping("/total-lecturers")
    public Long getTotalLecturers() {
        return statisticsService.countByRole(RoleEnum.ROLE_LECTURER);
    }

    @GetMapping("/total-students")
    public Long getTotalStudents() {
        return statisticsService.countByRole(RoleEnum.ROLE_STUDENT);
    }

    @GetMapping("/exam-score/{examId}")
    public ExamScoreStatisticsResponse getExamScoreStatistics(@PathVariable Long examId) {
        return statisticsService.getExamScoreStatistics(examId);
    }

    //GET /api/v1/statistics/student-scores/{classId}?page=0&size=10&sortBy=studentName&direction=asc
    @GetMapping("/student-scores/{classId}")
    public Page<StudentExamScoreResponse> getStudentScores(
            @PathVariable Long classId,
            @RequestParam(defaultValue = Constants.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = Constants.DEFAULT_SIZE) int size,
            @RequestParam(defaultValue = "studentName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = Sort.by(Sort.Order.by(sortBy));
        if ("desc".equals(direction)) {
            sort = sort.descending();
        }

        PageRequest pageRequest = PageRequest.of(page, size, sort);

        return statisticsService.getStudentScoresInClass(classId, pageRequest);
    }

    @GetMapping("/student-score-in-classes/{studentId}")
    public StudentScoreClassResultResponse getStudentScoreByClasses(@PathVariable Long studentId) {
        return statisticsService.getStudentScoreByClasses(studentId);
    }

    @GetMapping("/count/class/{teacherId}")
    public Long countClassByTeacherId(@PathVariable Long teacherId) {
        return statisticsService.countClassByTeacherId(teacherId);
    }

    @GetMapping("/count/exam/{teacherId}")
    public Long countExamByTeacherId(@PathVariable Long teacherId) {
        return statisticsService.countExamByTeacherId(teacherId);
    }
}
