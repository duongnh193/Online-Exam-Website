package vn.com.example.exam.online.service;

import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.com.example.exam.online.exception.QuestionNotFoundException;
import vn.com.example.exam.online.mapper.CreateQuestionRequest2QuestionMapper;
import vn.com.example.exam.online.mapper.Question2QuestionResponseMapper;
import vn.com.example.exam.online.model.ChoiceDto;
import vn.com.example.exam.online.model.QuestionType;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.entity.ExamSubmission;
import vn.com.example.exam.online.model.entity.Question;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.CreateQuestionRequest;
import vn.com.example.exam.online.model.request.QuestionCsvRecord;
import vn.com.example.exam.online.model.response.AnswerStatResponse;
import vn.com.example.exam.online.model.response.QuestionResponse;
import vn.com.example.exam.online.repository.ExamSubmissionRepository;
import vn.com.example.exam.online.repository.QuestionRepository;
import vn.com.example.exam.online.util.Constants;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final UserService userService;
    private final ExamService examService;
    private final ExamSubmissionRepository examSubmissionRepository;

    public QuestionResponse create(CreateQuestionRequest createQuestionRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        if (createQuestionRequest.getType() != QuestionType.ESSAY) {
            List<ChoiceDto> choices = createQuestionRequest.getChoices();
            if (choices == null || choices.size() != 4) {
                throw new IllegalArgumentException("Multiple-choice or single-choice questions must have exactly 4 choices.");
            }
        }

        User creator = userService.getUserByUsername(username);
        Exam exam = examService.getById(createQuestionRequest.getExamId());
        Question question = CreateQuestionRequest2QuestionMapper.INSTANCE.map(createQuestionRequest);
        question.setCreator(creator)
                .setExam(exam);
        return Question2QuestionResponseMapper.INSTANCE.map(questionRepository.save(question));
    }

    public QuestionResponse update(CreateQuestionRequest createQuestionRequest, Long questionId) {
        Question question = getById(questionId);
        CreateQuestionRequest2QuestionMapper.INSTANCE.mapTo(createQuestionRequest, question);
        return Question2QuestionResponseMapper.INSTANCE.map(questionRepository.save(question));
    }

    public QuestionResponse getQuestionById(Long questionId) {
        return Question2QuestionResponseMapper.INSTANCE.map(getById(questionId));
    }

    public Page<QuestionResponse> getQuestionsByExam(Long examId, Pageable pageable) {
        return questionRepository.findByExamId(examId, pageable).map(Question2QuestionResponseMapper.INSTANCE::map);
    }

    private Question getById(Long questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new QuestionNotFoundException(Constants.QUESTION_NOT_FOUND_ID.formatted(questionId)));
    }

    public void delete(Long questionId) {
        Question question = getById(questionId);
        questionRepository.delete(question);
    }

    public List<QuestionResponse> importFromCsv(MultipartFile file, Long examId) {
        List<Question> questions = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            CsvToBean<QuestionCsvRecord> csvToBean = new CsvToBeanBuilder<QuestionCsvRecord>(reader)
                    .withType(QuestionCsvRecord.class)
                    .withIgnoreLeadingWhiteSpace(true)
                    .build();

            List<QuestionCsvRecord> records = csvToBean.parse();

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User creator = userService.getUserByUsername(username);

            Exam exam = examService.getById(examId);

            for (QuestionCsvRecord record : records) {
                try {
                    if (record.getTitle() == null || record.getType() == null) {
                        continue;
                    }

                    QuestionType type = record.getType();
                    List<ChoiceDto> choices = null;
                    String answer = null;

                    if (type != QuestionType.ESSAY) {
                        choices = createChoices(record.getChoiceA(), record.getChoiceB(), record.getChoiceC(), record.getChoiceD());
                    }

                    if (type == QuestionType.ESSAY) {
                        answer = record.getAnswer(); //
                    } else if (type == QuestionType.SINGLE_CHOICE) {
                        List<String> answers = parseAnswers(record.getAnswer());
                        answer = (answers.isEmpty()) ? null : answers.get(0);
                    } else if (type == QuestionType.MULTIPLE_CHOICE) {
                        answer = String.join(",", parseAnswers(record.getAnswer()));
                    }

                    Question question = new Question()
                            .setExam(exam)
                            .setCreator(creator)
                            .setTitle(record.getTitle())
                            .setType(type)
                            .setChoices(choices)
                            .setAnswer(answer);

                    questions.add(question);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }

            if (!questions.isEmpty()) {
                questionRepository.saveAll(questions);
            }

        } catch (Exception e) {
            throw new RuntimeException("Không thể đọc file CSV: " + e.getMessage(), e);
        }


        return questions.stream().map(Question2QuestionResponseMapper.INSTANCE::map).toList();
    }

    private List<ChoiceDto> createChoices(String choiceA, String choiceB, String choiceC, String choiceD) {
        List<ChoiceDto> choices = new ArrayList<>();
        if (choiceA != null && !choiceA.trim().isEmpty()) {
            choices.add(new ChoiceDto("A", choiceA));
        }
        if (choiceB != null && !choiceB.trim().isEmpty()) {
            choices.add(new ChoiceDto("B", choiceB));
        }
        if (choiceC != null && !choiceC.trim().isEmpty()) {
            choices.add(new ChoiceDto("C", choiceC));
        }
        if (choiceD != null && !choiceD.trim().isEmpty()) {
            choices.add(new ChoiceDto("D", choiceD));
        }
        return choices;
    }

    private List<String> parseAnswers(String answers) {
        if (answers != null && !answers.trim().isEmpty()) {
            return List.of(answers.split("\\s*,\\s*"));
        }
        return new ArrayList<>();
    }

    public AnswerStatResponse getAnswerStatisticsByQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        List<ExamSubmission> submissions = examSubmissionRepository.findByQuestionId(questionId);

        Map<String, Long> stats;

        if (question.getType() == QuestionType.SINGLE_CHOICE || question.getType() == QuestionType.MULTIPLE_CHOICE) {
            Map<String, String> valueToKey = question.getChoices().stream()
                    .collect(Collectors.toMap(ChoiceDto::getOptionValue, ChoiceDto::getOptionKey));

            stats = submissions.stream()
                    .filter(sub -> sub.getAnswer() != null && !sub.getAnswer().isBlank())
                    .flatMap(sub -> Arrays.stream(sub.getAnswer().split(",")))
                    .map(String::trim)
                    .map(value -> valueToKey.getOrDefault(value, "UNKNOWN"))
                    .collect(Collectors.groupingBy(
                            Function.identity(),
                            Collectors.counting()
                    ));

            question.getChoices().forEach(choice -> stats.putIfAbsent(choice.getOptionKey(), 0L));
        } else {
            stats = submissions.stream()
                    .filter(sub -> sub.getAnswer() != null && !sub.getAnswer().isBlank())
                    .collect(Collectors.groupingBy(
                            ExamSubmission::getAnswer,
                            Collectors.counting()
                    ));
        }

        long total = submissions.stream().filter(sub -> sub.getAnswer() != null).count();

        return new AnswerStatResponse(
                question.getId(),
                question.getTitle(),
                question.getType(),
                stats,
                total
        );
    }
}
