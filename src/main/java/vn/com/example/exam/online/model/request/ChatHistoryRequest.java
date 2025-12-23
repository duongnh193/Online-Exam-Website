package vn.com.example.exam.online.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ChatHistoryRequest {
    @NotBlank(message = "Conversation ID is required")
    private String conversationId;

    private String title;

    @NotNull(message = "Messages are required")
    private List<Map<String, Object>> messages;
}

