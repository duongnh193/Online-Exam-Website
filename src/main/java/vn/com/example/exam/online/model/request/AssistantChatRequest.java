package vn.com.example.exam.online.model.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AssistantChatRequest {

    @NotEmpty(message = "Conversation messages must not be empty")
    private List<@Valid AssistantMessage> messages;

    private Map<String, Object> metadata;

    @Data
    public static class AssistantMessage {
        @NotBlank(message = "Message role is required")
        private String role;

        @NotBlank(message = "Message content is required")
        private String content;
    }
}
