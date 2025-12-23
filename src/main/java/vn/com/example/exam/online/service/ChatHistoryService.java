package vn.com.example.exam.online.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.com.example.exam.online.model.entity.ChatHistory;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.ChatHistoryRequest;
import vn.com.example.exam.online.model.response.ChatHistoryResponse;
import vn.com.example.exam.online.repository.ChatHistoryRepository;
import vn.com.example.exam.online.repository.UserRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatHistoryService {

    private final ChatHistoryRepository chatHistoryRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public ChatHistoryResponse saveChatHistory(Long userId, ChatHistoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ChatHistory existingHistory = chatHistoryRepository
                .findByUserIdAndConversationId(userId, request.getConversationId())
                .orElse(null);

        try {
            String messagesJson = objectMapper.writeValueAsString(request.getMessages());
            int messageCount = request.getMessages().size();

            // Generate title from first user message if not provided
            String title = request.getTitle();
            if (title == null || title.trim().isEmpty()) {
                title = request.getMessages().stream()
                        .filter(msg -> "user".equals(msg.get("role")))
                        .findFirst()
                        .map(msg -> {
                            String text = String.valueOf(msg.get("text"));
                            return text.length() > 50 ? text.substring(0, 50) + "..." : text;
                        })
                        .orElse("New Conversation");
            }

            ChatHistory chatHistory;
            if (existingHistory != null) {
                // Update existing
                existingHistory.setTitle(title);
                existingHistory.setMessages(messagesJson);
                existingHistory.setMessageCount(messageCount);
                existingHistory.setUpdatedAt(OffsetDateTime.now());
                chatHistory = chatHistoryRepository.save(existingHistory);
            } else {
                // Create new
                chatHistory = new ChatHistory()
                        .setUser(user)
                        .setConversationId(request.getConversationId())
                        .setTitle(title)
                        .setMessages(messagesJson)
                        .setMessageCount(messageCount)
                        .setCreatedAt(OffsetDateTime.now())
                        .setUpdatedAt(OffsetDateTime.now());
                chatHistory = chatHistoryRepository.save(chatHistory);
            }

            return mapToResponse(chatHistory);
        } catch (Exception e) {
            log.error("Error saving chat history", e);
            throw new RuntimeException("Failed to save chat history", e);
        }
    }

    @Transactional(readOnly = true)
    public List<ChatHistoryResponse> getAllChatHistoriesByUserId(Long userId) {
        List<ChatHistory> histories = chatHistoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return histories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatHistoryResponse getChatHistoryByConversationId(Long userId, String conversationId) {
        ChatHistory chatHistory = chatHistoryRepository
                .findByUserIdAndConversationId(userId, conversationId)
                .orElseThrow(() -> new RuntimeException(
                        "Chat history not found for conversation: " + conversationId));
        return mapToResponse(chatHistory);
    }

    @Transactional
    public void deleteChatHistory(Long userId, String conversationId) {
        ChatHistory chatHistory = chatHistoryRepository
                .findByUserIdAndConversationId(userId, conversationId)
                .orElseThrow(() -> new RuntimeException(
                        "Chat history not found for conversation: " + conversationId));
        chatHistoryRepository.delete(chatHistory);
    }

    @Transactional
    public void deleteAllChatHistoriesByUserId(Long userId) {
        chatHistoryRepository.deleteByUserId(userId);
    }

    private ChatHistoryResponse mapToResponse(ChatHistory chatHistory) {
        try {
            List<Map<String, Object>> messages = objectMapper.readValue(
                    chatHistory.getMessages(),
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            return new ChatHistoryResponse()
                    .setId(chatHistory.getId())
                    .setUserId(chatHistory.getUser().getId())
                    .setConversationId(chatHistory.getConversationId())
                    .setTitle(chatHistory.getTitle())
                    .setMessages(messages)
                    .setMessageCount(chatHistory.getMessageCount())
                    .setCreatedAt(chatHistory.getCreatedAt())
                    .setUpdatedAt(chatHistory.getUpdatedAt());
        } catch (Exception e) {
            log.error("Error mapping chat history to response", e);
            throw new RuntimeException("Failed to map chat history", e);
        }
    }
}

