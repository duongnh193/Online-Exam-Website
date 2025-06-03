package vn.com.example.exam.online.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Converter
public class OffsetDateTimeListConverter implements AttributeConverter<List<OffsetDateTime>, String> {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<OffsetDateTime> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            return mapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert OffsetDateTime list to JSON", e);
        }
    }

    @Override
    public List<OffsetDateTime> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return mapper.readValue(dbData, new TypeReference<List<OffsetDateTime>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert JSON to OffsetDateTime list", e);
        }
    }
}

