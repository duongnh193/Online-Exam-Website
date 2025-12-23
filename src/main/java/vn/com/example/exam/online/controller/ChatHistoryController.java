package vn.com.example.exam.online.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.com.example.exam.online.model.entity.User;
import vn.com.example.exam.online.model.request.ChatHistoryRequest;
import vn.com.example.exam.online.model.response.ChatHistoryResponse;
import vn.com.example.exam.online.service.ChatHistoryService;
import vn.com.example.exam.online.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat-history")
@RequiredArgsConstructor
public class ChatHistoryController {

    private final ChatHistoryService chatHistoryService;
    private final UserService userService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            String username = authentication.getName();
            User user = userService.getUserByUsername(username);
            return user.getId();
        }
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatHistoryResponse>> getAllConversations() {
        Long userId = getCurrentUserId();
        List<ChatHistoryResponse> conversations = chatHistoryService.getAllChatHistoriesByUserId(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ChatHistoryResponse> getConversation(@PathVariable String conversationId) {
        Long userId = getCurrentUserId();
        ChatHistoryResponse conversation = chatHistoryService.getChatHistoryByConversationId(userId, conversationId);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/conversations")
    public ResponseEntity<ChatHistoryResponse> createConversation(@Valid @RequestBody ChatHistoryRequest request) {
        Long userId = getCurrentUserId();
        ChatHistoryResponse response = chatHistoryService.saveChatHistory(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/conversations/{conversationId}")
    public ResponseEntity<ChatHistoryResponse> updateConversation(
            @PathVariable String conversationId,
            @Valid @RequestBody ChatHistoryRequest request) {
        Long userId = getCurrentUserId();
        // Ensure conversationId matches
        if (!conversationId.equals(request.getConversationId())) {
            request.setConversationId(conversationId);
        }
        ChatHistoryResponse response = chatHistoryService.saveChatHistory(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String conversationId) {
        Long userId = getCurrentUserId();
        chatHistoryService.deleteChatHistory(userId, conversationId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/conversations")
    public ResponseEntity<Void> deleteAllConversations() {
        Long userId = getCurrentUserId();
        chatHistoryService.deleteAllChatHistoriesByUserId(userId);
        return ResponseEntity.noContent().build();
    }
}

