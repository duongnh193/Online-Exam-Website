package vn.com.example.exam.online.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.com.example.exam.online.mapper.StudentExam2StudentExamResultResponseMapper;
import vn.com.example.exam.online.model.ExamResult;
import vn.com.example.exam.online.model.ExamReviewMode;
import vn.com.example.exam.online.model.QuestionDetail;
import vn.com.example.exam.online.model.QuestionType;
import vn.com.example.exam.online.model.StudentExamStatus;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.entity.ExamSubmission;
import vn.com.example.exam.online.model.entity.Question;
import vn.com.example.exam.online.model.entity.StudentExam;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.response.QuestionExamResponse;
import vn.com.example.exam.online.model.response.StudentExamDetailResponse;
import vn.com.example.exam.online.model.response.StudentExamResponse;
import vn.com.example.exam.online.model.response.StudentExamResultResponse;
import vn.com.example.exam.online.model.response.StudentExamSimpleResponse;
import vn.com.example.exam.online.repository.ExamRepository;
import vn.com.example.exam.online.repository.ExamSubmissionRepository;
import vn.com.example.exam.online.repository.QuestionRepository;
import vn.com.example.exam.online.repository.StudentClassRepository;
import vn.com.example.exam.online.repository.StudentExamRepository;
import vn.com.example.exam.online.repository.UserRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static vn.com.example.exam.online.model.ExamReviewMode.FULL;
import static vn.com.example.exam.online.model.ExamReviewMode.INCORRECT_ONLY;

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
        if (!isCurrentUserInClass(student.getId(), exam.getClassEntity().getId())) {
            throw new RuntimeException("Student is not in class");
        }
        if (!password.equals(exam.getPassword())) {
            throw new RuntimeException("Wrong password");
        }
        LocalDateTime timeNow = LocalDateTime.now();
        if (timeNow.isBefore(exam.getStartAt())) {
            throw new RuntimeException("The exam has not started yet.");
        }

        if (timeNow.isAfter(exam.getEndAt())) {
            throw new RuntimeException("The exam has already ended.");
        }
        String studentExamId = student.getId() + "-" + examId;

        // Kiểm tra xem bài thi đã được bắt đầu chưa
        Optional<StudentExam> existingExam = studentExamRepository.findById(studentExamId);

        if (existingExam.isPresent()) {
            StudentExam studentExam = existingExam.get();
            if (studentExam.getStatus() == StudentExamStatus.IN_PROGRESS) {
                var now = OffsetDateTime.now();
                var remainingTime = Duration.between(now, studentExam.getFinishAtEstimate()).toSeconds();

                // Nếu thời gian làm bài đã hết, đánh dấu là hoàn thành
                if (remainingTime <= 0) {
                    studentExam.setStatus(StudentExamStatus.COMPLETED);
                    studentExamRepository.save(studentExam);
                    throw new RuntimeException("Time's up! Exam already completed");
                }

                // Lấy câu hỏi hiện tại
                List<Question> orderedQuestions = getOrderedQuestions(exam);
                int currentIndex = Optional.ofNullable(studentExam.getCurrentQuestion()).orElse(0);
                Question currentQuestion = orderedQuestions.get(currentIndex);

                return new StudentExamResponse(studentExam, mapToQuestionResponse(currentQuestion), false, remainingTime);
            } else if (studentExam.getStatus() == StudentExamStatus.COMPLETED) {
                throw new RuntimeException("Exam already completed");
            }
        }
        var now = OffsetDateTime.now();
        // Tạo đối tượng StudentExam mới nếu chưa có
        StudentExam studentExam = new StudentExam()
                .setId(studentExamId)  // Sử dụng ID ghép
                .setExam(exam)
                .setStudent(student)
                .setScore(0.0)
                .setStatus(StudentExamStatus.IN_PROGRESS)
                .setStartAt(now)
                .setFinishAtEstimate(now.plusMinutes(exam.getDuration()))
                .setTime(exam.getDuration())
                .setCurrentQuestion(0);

        studentExam = studentExamRepository.save(studentExam);

        // Lấy câu hỏi đầu tiên
        Question firstQuestion = getOrderedQuestions(exam).get(0);
        return new StudentExamResponse(studentExam, mapToQuestionResponse(firstQuestion), false, null);
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
                .setAnswer(answer.trim())
                .setIsCorrect(isCorrect);
        examSubmissionRepository.save(submission);
        List<Question> orderedQuestions = getOrderedQuestions(studentExam.getExam());
        int currentIndex = findIndexById(orderedQuestions, questionId);
        double score = calculateScore(studentExam);
        studentExam.setScore(score);
        boolean isLast = (currentIndex + 1 == orderedQuestions.size());
        if (!isLast) {
            studentExam.setCurrentQuestion(currentIndex + 1);
            studentExamRepository.save(studentExam);
            Question nextQuestion = orderedQuestions.get(currentIndex + 1);
            return new StudentExamResponse(studentExam, mapToQuestionResponse(nextQuestion), false, null);
        } else {
            studentExamRepository.save(studentExam); // vẫn lưu lại score, currentQuestion
            return new StudentExamResponse(studentExam, null, true, null); // isLast = true
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
        double score = totalQuestions > 0 ? (correctAnswersCount * 10.0) / totalQuestions : 0.0;

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

        String correctAnswer = question.getAnswer().trim();
        String userAnswer = answer.trim();

        if (question.getType() == QuestionType.MULTIPLE_CHOICE) {
            List<String> correctList = Arrays.stream(correctAnswer.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .sorted()
                    .toList();

            List<String> userList = Arrays.stream(userAnswer.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .sorted()
                    .toList();

            return correctList.equals(userList);
        }

        return correctAnswer.equalsIgnoreCase(userAnswer);
    }

    private double calculateScore(StudentExam studentExam) {
        List<ExamSubmission> submissions = examSubmissionRepository.findByStudentExamId(studentExam.getId());

        long totalQuestions = studentExam.getExam().getQuestions().size();
        long correctAnswers = submissions.stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsCorrect()))
                .count();

        if (totalQuestions == 0) return 0.0;

        return (correctAnswers * 10.0) / totalQuestions;
    }

    private User getAuthenticatedStudent() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private QuestionExamResponse mapToQuestionResponse(Question question) {
        return new QuestionExamResponse(question.getId(), question.getTitle(), question.getType(),
                question.getChoices(), question.getImage());
    }

    private boolean isCurrentUserInClass(Long userId, Long classId) {
        return studentClassRepository.existsByStudentIdAndClassEntityId(userId, classId);
    }

    public void increaseSwitchTab(String studentExamId) {
        var studentExam = studentExamRepository.findById(studentExamId).orElseThrow(()
                -> new RuntimeException("Student exam not found"));
        studentExam.getSwitchTab().add(OffsetDateTime.now());
        studentExamRepository.save(studentExam);
    }

    public List<StudentExamSimpleResponse> getStudentExamsByExamId(Long examId) {
        List<StudentExam> studentExams = studentExamRepository.findByExamId(examId);
        return studentExams.stream().map(se -> new StudentExamSimpleResponse(
                se.getId(),
                se.getStudent().getId(),
                se.getStudent().getFirstName() + " " + se.getStudent().getLastName(),
                se.getStatus(),
                se.getStartAt(),
                se.getFinishAt(),
                se.getScore()
        )).toList();
    }

    public StudentExamDetailResponse getStudentExamDetail(String studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        List<ExamSubmission> submissions = examSubmissionRepository.findByStudentExamId(studentExamId);

        List<QuestionDetail> details = submissions.stream().map(sub -> {
            Question q = sub.getQuestion();
            return new QuestionDetail(
                    q.getId(),
                    q.getTitle(),
                    q.getType(),
                    q.getChoices(),
                    q.getAnswer(),
                    sub.getAnswer(),
                    sub.getIsCorrect()
            );
        }).toList();

        return new StudentExamDetailResponse(studentExamId, studentExam.getSwitchTab(), details);
    }

    public StudentExamDetailResponse getStudentExamDetailById(String studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("StudentExam not found"));

        if (studentExam.getStatus() != StudentExamStatus.COMPLETED) {
            OffsetDateTime now = OffsetDateTime.now();
            OffsetDateTime deadline = studentExam.getFinishAtEstimate();

            if (deadline != null && now.isAfter(deadline)) {
                studentExam.setStatus(StudentExamStatus.COMPLETED);
                studentExamRepository.save(studentExam);
            } else {
                throw new RuntimeException("You have not completed the exam or it is not yet available for review.");
            }
        }

        Exam exam = studentExam.getExam();
        ExamReviewMode reviewMode = exam.getReviewMode();

        if (reviewMode == ExamReviewMode.NONE) {
            return new StudentExamDetailResponse(studentExamId, studentExam.getSwitchTab(), List.of());
        }

        List<ExamSubmission> submissions = examSubmissionRepository.findByStudentExamId(studentExamId);

        List<QuestionDetail> details = submissions.stream()
                .map(sub -> {
                    Question q = sub.getQuestion();

                    String correctAnswer = (reviewMode == ExamReviewMode.FULL) ? q.getAnswer() : null;

                    return new QuestionDetail(
                            q.getId(),
                            q.getTitle(),
                            q.getType(),
                            q.getChoices(),
                            correctAnswer,
                            sub.getAnswer(),
                            sub.getIsCorrect()
                    );
                })
                .toList();

        return new StudentExamDetailResponse(studentExamId, studentExam.getSwitchTab(), details);
    }


}



