package vn.com.example.exam.online.model.response;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AssistantChatResponse {
    private String answer;
    private String provider;
    private String model;
    private Map<String, Object> usage;
}
