package vn.com.example.exam.online.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import vn.com.example.exam.online.model.ChoiceDto;

import java.util.List;

@Converter
public class ChoiceDtoConverter implements AttributeConverter<List<ChoiceDto>, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<ChoiceDto> choiceDtos) {
        try {
            return objectMapper.writeValueAsString(choiceDtos);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting List<ChoiceDto> to JSON", e);
        }
    }

    @Override
    public List<ChoiceDto> convertToEntityAttribute(String dbData) {
        try {
            return objectMapper.readValue(dbData, objectMapper.getTypeFactory().constructCollectionType(List.class, ChoiceDto.class));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting JSON to List<ChoiceDto>", e);
        }
    }
}

