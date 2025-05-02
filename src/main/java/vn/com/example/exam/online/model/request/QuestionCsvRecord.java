package vn.com.example.exam.online.model.request;

import com.opencsv.bean.CsvBindByName;
import lombok.Data;
import vn.com.example.exam.online.model.QuestionType;

@Data
public class QuestionCsvRecord {
    @CsvBindByName
    private String title;

    @CsvBindByName
    private QuestionType type;

    @CsvBindByName
    private String choiceA;
    @CsvBindByName
    private String choiceB;
    @CsvBindByName
    private String choiceC;
    @CsvBindByName
    private String choiceD;

    @CsvBindByName
    private String answer;
}

