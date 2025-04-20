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
import vn.com.example.exam.online.model.QuestionType;
import vn.com.example.exam.online.model.entity.Exam;
import vn.com.example.exam.online.model.entity.Question;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.CreateQuestionRequest;
import vn.com.example.exam.online.model.request.QuestionCsvRecord;
import vn.com.example.exam.online.model.response.QuestionResponse;
import vn.com.example.exam.online.repository.QuestionRepository;
import vn.com.example.exam.online.util.Constants;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final UserService userService;
    private final ExamService examService;

    public QuestionResponse create(CreateQuestionRequest createQuestionRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

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

    public List<QuestionResponse> importFromCsv(MultipartFile file) {
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

            for (int i = 0; i < records.size(); i++) {
                QuestionCsvRecord record = records.get(i);

                try {
                    if (record.getExamId() == null || record.getTitle() == null || record.getType() == null) {
                        continue;
                    }

                    Exam exam = examService.getById(record.getExamId());

                    QuestionType type = record.getType();
                    String choice = (type == QuestionType.ESSAY) ? null : record.getChoice();
                    String answer = (type == QuestionType.ESSAY) ? null : record.getAnswer();

                    Question question = new Question()
                            .setExam(exam)
                            .setCreator(creator)
                            .setTitle(record.getTitle())
                            .setType(type)
                            .setChoice(choice)
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
}
