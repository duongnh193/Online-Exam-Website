package vn.com.example.exam.online.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.com.example.exam.online.mapper.StudentExam2StudentExamResultResponseMapper;
import vn.com.example.exam.online.model.ExamResult;
import vn.com.example.exam.online.model.QuestionType;
import vn.com.example.exam.online.model.StudentExamStatus;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.entity.ExamSubmission;
import vn.com.example.exam.online.model.entity.Question;
import vn.com.example.exam.online.model.entity.StudentExam;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.response.QuestionExamResponse;
import vn.com.example.exam.online.model.response.StudentExamResponse;
import vn.com.example.exam.online.model.response.StudentExamResultResponse;
import vn.com.example.exam.online.repository.ExamRepository;
import vn.com.example.exam.online.repository.ExamSubmissionRepository;
import vn.com.example.exam.online.repository.QuestionRepository;
import vn.com.example.exam.online.repository.StudentClassRepository;
import vn.com.example.exam.online.repository.StudentExamRepository;
import vn.com.example.exam.online.repository.UserRepository;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentExamService {

    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final StudentExamRepository studentExamRepository;
    private final ExamSubmissionRepository examSubmissionRepository;
    private final QuestionRepository questionRepository;
    private final StudentClassRepository studentClassRepository;

    public StudentExamResultResponse getResult(String id) {
        var studentExam = studentExamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student exam not found with id: %s".formatted(id)));
        return StudentExam2StudentExamResultResponseMapper.INSTANCE.map(studentExam);
    }

    public StudentExamResponse startExam(Long examId, String password) {
        User student = getAuthenticatedStudent();
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        if(!isCurrentUserInClass(student.getId(), exam.getClassEntity().getId())) {
            throw new RuntimeException("Student is not in class");
        }
        if(!password.equals(exam.getPassword())) {
            throw new RuntimeException("Wrong password");
        }
        String studentExamId = student.getId() + "-" + examId;

        // Tạo đối tượng StudentExam và lưu vào DB
        StudentExam studentExam = new StudentExam()
                .setId(studentExamId)  // Sử dụng id ghép
                .setExam(exam)
                .setStudent(student)
                .setScore(0.0)
                .setStatus(StudentExamStatus.IN_PROGRESS)
                .setStartAt(OffsetDateTime.now())
                .setTime(exam.getDuration());

        studentExam = studentExamRepository.save(studentExam);

        Question firstQuestion = getOrderedQuestions(exam).get(0);

        return new StudentExamResponse(studentExam, mapToQuestionResponse(firstQuestion), false);
    }

    private List<Question> getOrderedQuestions(Exam exam) {
        return exam.getQuestions().stream()
                .sorted(Comparator.comparing(Question::getId))
                .toList();
    }

    public StudentExamResponse submitAnswer(String studentExamId, Long questionId, String answer) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam not found"));
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        boolean isCorrect = checkAnswer(question, answer);

        ExamSubmission submission = new ExamSubmission()
                .setStudentExam(studentExam)
                .setQuestion(question)
                .setAnswer(answer)
                .setIsCorrect(isCorrect);
        examSubmissionRepository.save(submission);

        double score = calculateScore(studentExam);
        studentExam.setScore(score);
        studentExamRepository.save(studentExam);

        List<Question> orderedQuestions = getOrderedQuestions(studentExam.getExam());
        int currentIndex = findIndexById(orderedQuestions, questionId);

        if (currentIndex + 1 < orderedQuestions.size()) {
            Question nextQuestion = orderedQuestions.get(currentIndex + 1);
            return new StudentExamResponse(studentExam, mapToQuestionResponse(nextQuestion), false);
        } else {
            return new StudentExamResponse(studentExam, null, true); // nextQuestion = null, isLast = true
        }

    }

    private int findIndexById(List<Question> list, Long id) {
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getId().equals(id)) return i;
        }
        return -1;
    }

    public ExamResult submitExam(String studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam not found"));

        List<ExamSubmission> submissions = examSubmissionRepository.findByStudentExamId(studentExamId);
        long correctAnswersCount = submissions.stream()
                .filter(ExamSubmission::getIsCorrect)
                .count();
        int totalQuestions = submissions.size();
        double score = totalQuestions > 0 ? (correctAnswersCount * 100.0) / totalQuestions : 0.0;

        studentExam.setScore(score);
        studentExam.setStatus(StudentExamStatus.COMPLETED);
        studentExam.setFinishAt(OffsetDateTime.now());
        long minutesSpent = Duration.between(studentExam.getStartAt(), studentExam.getFinishAt()).toMinutes();
        studentExam.setTime((int) minutesSpent);
        studentExamRepository.save(studentExam);
        return new ExamResult(correctAnswersCount, totalQuestions - correctAnswersCount, totalQuestions, score, Duration.between(studentExam.getFinishAt(), studentExam.getStartAt()));
    }

    private boolean checkAnswer(Question question, String answer) {
        if (question.getAnswer() == null || answer == null) return false;
        if (question.getType() == QuestionType.ESSAY) {
            return question.getAnswer().trim().equalsIgnoreCase(answer.trim());
        }
        return question.getAnswer().equalsIgnoreCase(answer);
    }

    private double calculateScore(StudentExam studentExam) {
        List<ExamSubmission> submissions = examSubmissionRepository.findByStudentExamId(studentExam.getId());

        long totalQuestions = submissions.size();
        long correctAnswers = submissions.stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsCorrect()))
                .count();

        if (totalQuestions == 0) return 0.0;

        return (correctAnswers * 100.0) / totalQuestions;
    }


    private Question getNextQuestion(Exam exam, Long currentQuestionId) {
        return exam.getQuestions().stream()
                .filter(q -> q.getId() > currentQuestionId)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No more questions available"));
    }

    private User getAuthenticatedStudent() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private QuestionExamResponse mapToQuestionResponse(Question question) {
        return new QuestionExamResponse(question.getId(), question.getTitle(), question.getType(), question.getChoices());
    }

    private boolean isCurrentUserInClass(Long userId, Long classId) {
        return studentClassRepository.existsByStudentIdAndClassEntityId(userId, classId);
    }
}



