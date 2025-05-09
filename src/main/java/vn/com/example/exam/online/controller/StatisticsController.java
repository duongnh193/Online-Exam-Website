package vn.com.example.exam.online.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.com.example.exam.online.model.response.ExamScoreStatisticsResponse;
import vn.com.example.exam.online.service.StatisticsService;

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

    @GetMapping("/exam-score/{examId}")
    public ExamScoreStatisticsResponse getExamScoreStatistics(@PathVariable Long examId) {
        return statisticsService.getExamScoreStatistics(examId);
    }
}
