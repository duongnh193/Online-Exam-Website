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
import vn.com.example.exam.online.model.response.QuestionStateResponse;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
        Optional<StudentExam> existingExam = studentExamRepository.findById(studentExamId);

        if (existingExam.isPresent()) {
            StudentExam studentExam = existingExam.get();
            if (studentExam.getStatus() == StudentExamStatus.IN_PROGRESS) {
                Long remainingTime = calculateSecondsRemaining(studentExam);

                if (remainingTime != null && remainingTime <= 0) {
                    studentExam.setStatus(StudentExamStatus.COMPLETED);
                    studentExamRepository.save(studentExam);
                    throw new RuntimeException("Time's up! Exam already completed");
                }

                List<Question> orderedQuestions = getOrderedQuestions(studentExam.getExam());
                int currentIndex = sanitizeIndex(
                        Optional.ofNullable(studentExam.getCurrentQuestion()).orElse(0),
                        orderedQuestions.size()
                );
                studentExam.setCurrentQuestion(currentIndex);
                studentExamRepository.save(studentExam);

                Map<Long, ExamSubmission> submissions = getLatestSubmissions(studentExamId);
                return buildStudentExamResponse(studentExam, orderedQuestions, submissions, currentIndex);
            } else if (studentExam.getStatus() == StudentExamStatus.COMPLETED) {
                throw new RuntimeException("Exam already completed");
            }
        }

        OffsetDateTime now = OffsetDateTime.now();

        StudentExam studentExam = existingExam.orElseGet(() -> new StudentExam()
                .setId(studentExamId)
                .setExam(exam)
                .setStudent(student)
                .setScore(0.0)
                .setStatus(StudentExamStatus.IN_PROGRESS)
                .setStartAt(now)
                .setFinishAtEstimate(now.plusMinutes(exam.getDuration()))
                .setTime(exam.getDuration())
                .setCurrentQuestion(0));

        studentExam = studentExamRepository.save(studentExam);

        List<Question> orderedQuestions = getOrderedQuestions(studentExam.getExam());
        Map<Long, ExamSubmission> submissions = getLatestSubmissions(studentExamId);
        return buildStudentExamResponse(studentExam, orderedQuestions, submissions, 0);
    }

    public StudentExamResponse submitAnswer(String studentExamId, Long questionId, String answer, Integer currentQuestionIndex) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam not found"));
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        List<Question> orderedQuestions = getOrderedQuestions(studentExam.getExam());
        int questionIndex = findIndexById(orderedQuestions, questionId);
        if (questionIndex < 0) {
            throw new RuntimeException("Question does not belong to this exam");
        }

        String normalizedAnswer = answer != null ? answer.trim() : null;

        Optional<ExamSubmission> existingSubmission = examSubmissionRepository
                .findTopByStudentExamIdAndQuestionIdOrderByIdDesc(studentExamId, questionId);

        if (normalizedAnswer == null || normalizedAnswer.isBlank()) {
            existingSubmission.ifPresent(examSubmissionRepository::delete);
        } else {
            ExamSubmission submission = existingSubmission.orElseGet(() -> new ExamSubmission()
                    .setStudentExam(studentExam)
                    .setQuestion(question));
            submission.setAnswer(normalizedAnswer);
            submission.setIsCorrect(checkAnswer(question, normalizedAnswer));
            examSubmissionRepository.save(submission);
        }

        int targetIndex = currentQuestionIndex != null
                ? sanitizeIndex(currentQuestionIndex, orderedQuestions.size())
                : questionIndex;

        studentExam.setCurrentQuestion(targetIndex);
        studentExam.setScore(calculateScore(studentExam));
        studentExamRepository.save(studentExam);

        Map<Long, ExamSubmission> submissions = getLatestSubmissions(studentExamId);
        return buildStudentExamResponse(studentExam, orderedQuestions, submissions, targetIndex);
    }

    public StudentExamResponse getQuestion(String studentExamId, int questionIndex) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam not found"));

        List<Question> orderedQuestions = getOrderedQuestions(studentExam.getExam());
        if (orderedQuestions.isEmpty()) {
            throw new RuntimeException("Exam does not contain any questions");
        }

        int sanitizedIndex = sanitizeIndex(questionIndex, orderedQuestions.size());
        studentExam.setCurrentQuestion(sanitizedIndex);
        studentExamRepository.save(studentExam);

        Map<Long, ExamSubmission> submissions = getLatestSubmissions(studentExamId);
        return buildStudentExamResponse(studentExam, orderedQuestions, submissions, sanitizedIndex);
    }

    public ExamResult submitExam(String studentExamId) {
        StudentExam studentExam = studentExamRepository.findById(studentExamId)
                .orElseThrow(() -> new RuntimeException("Student exam not found"));

        Map<Long, ExamSubmission> submissions = getLatestSubmissions(studentExamId);
        long correctAnswersCount = submissions.values().stream()
                .filter(ExamSubmission::getIsCorrect)
                .count();
        int totalQuestions = studentExam.getExam().getQuestions().size();
        double score = totalQuestions > 0 ? (correctAnswersCount * 10.0) / totalQuestions : 0.0;

        studentExam.setScore(score);
        studentExam.setStatus(StudentExamStatus.COMPLETED);
        studentExam.setFinishAt(OffsetDateTime.now());
        long minutesSpent = Duration.between(studentExam.getStartAt(), studentExam.getFinishAt()).toMinutes();
        studentExam.setTime((int) minutesSpent);
        studentExamRepository.save(studentExam);

        long wrongAnswers = totalQuestions - correctAnswersCount;
        return new ExamResult(correctAnswersCount, wrongAnswers, totalQuestions, score,
                Duration.between(studentExam.getStartAt(), studentExam.getFinishAt()));
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
        Map<Long, ExamSubmission> submissions = getLatestSubmissions(studentExam.getId());

        long totalQuestions = studentExam.getExam().getQuestions().size();
        long correctAnswers = submissions.values().stream()
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

        Map<Long, ExamSubmission> submissions = getLatestSubmissions(studentExamId);

        List<QuestionDetail> details = submissions.values().stream().map(sub -> {
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

        Map<Long, ExamSubmission> submissions = getLatestSubmissions(studentExamId);

        List<QuestionDetail> details = submissions.values().stream()
                .map(sub -> {
                    Question q = sub.getQuestion();

                    String correctAnswer = (reviewMode == FULL) ? q.getAnswer() : null;
                    if (reviewMode == INCORRECT_ONLY && Boolean.TRUE.equals(sub.getIsCorrect())) {
                        correctAnswer = null;
                    }

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

    private List<Question> getOrderedQuestions(Exam exam) {
        return exam.getQuestions().stream()
                .sorted(Comparator.comparing(Question::getId))
                .toList();
    }

    private int findIndexById(List<Question> list, Long id) {
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getId().equals(id)) return i;
        }
        return -1;
    }

    private Map<Long, ExamSubmission> getLatestSubmissions(String studentExamId) {
        List<ExamSubmission> submissions = examSubmissionRepository.findByStudentExamId(studentExamId);
        submissions.sort(Comparator.comparing(ExamSubmission::getId));

        Map<Long, ExamSubmission> latest = new LinkedHashMap<>();
        for (ExamSubmission submission : submissions) {
            latest.put(submission.getQuestion().getId(), submission);
        }
        return latest;
    }

    private List<QuestionStateResponse> buildQuestionStates(List<Question> orderedQuestions, Map<Long, ExamSubmission> submissions) {
        List<QuestionStateResponse> states = new ArrayList<>();
        for (int i = 0; i < orderedQuestions.size(); i++) {
            Question question = orderedQuestions.get(i);
            ExamSubmission submission = submissions.get(question.getId());
            boolean answered = submission != null && submission.getAnswer() != null && !submission.getAnswer().isBlank();
            Boolean correct = submission != null ? submission.getIsCorrect() : null;
            states.add(new QuestionStateResponse(question.getId(), i, answered, correct));
        }
        return states;
    }

    private StudentExamResponse buildStudentExamResponse(StudentExam studentExam,
                                                         List<Question> orderedQuestions,
                                                         Map<Long, ExamSubmission> submissions,
                                                         int currentIndex) {
        StudentExamResponse response = new StudentExamResponse();
        response.setStudentExam(studentExam);
        response.setTotalQuestions(orderedQuestions.size());

        if (!orderedQuestions.isEmpty()) {
            int sanitizedIndex = sanitizeIndex(currentIndex, orderedQuestions.size());
            Question currentQuestion = orderedQuestions.get(sanitizedIndex);
            studentExam.getExam().setQuestions(new ArrayList<>(orderedQuestions));

            response.setQuestion(mapToQuestionResponse(currentQuestion));
            response.setCurrentIndex(sanitizedIndex);
            response.setAnswer(Optional.ofNullable(submissions.get(currentQuestion.getId()))
                    .map(ExamSubmission::getAnswer)
                    .orElse(null));
            response.setFirstQuestion(sanitizedIndex == 0);
            response.setLastQuestion(sanitizedIndex == orderedQuestions.size() - 1);
        } else {
            response.setCurrentIndex(0);
            response.setFirstQuestion(true);
            response.setLastQuestion(true);
        }

        response.setQuestionStates(buildQuestionStates(orderedQuestions, submissions));
        response.setCompleted(studentExam.getStatus() == StudentExamStatus.COMPLETED);
        response.setSecondsRemaining(calculateSecondsRemaining(studentExam));
        return response;
    }

    private Long calculateSecondsRemaining(StudentExam studentExam) {
        if (studentExam.getFinishAtEstimate() == null) {
            return null;
        }
        long seconds = Duration.between(OffsetDateTime.now(), studentExam.getFinishAtEstimate()).toSeconds();
        return Math.max(seconds, 0);
    }

    private int sanitizeIndex(int index, int size) {
        if (size <= 0) {
            return 0;
        }
        if (index < 0) {
            return 0;
        }
        if (index >= size) {
            return size - 1;
        }
        return index;
    }
}
