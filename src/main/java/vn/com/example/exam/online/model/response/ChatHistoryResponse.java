package vn.com.example.exam.online.model.response;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@Accessors(chain = true)
public class ChatHistoryResponse {
    private Long id;
    private Long userId;
    private String conversationId;
    private String title;
    private List<Map<String, Object>> messages;
    private Integer messageCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

