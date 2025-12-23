package vn.com.example.exam.online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.example.exam.online.model.entity.ChatHistory;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserIdOrderByUpdatedAtDesc(Long userId);
    
    Optional<ChatHistory> findByConversationId(String conversationId);
    
    Optional<ChatHistory> findByUserIdAndConversationId(Long userId, String conversationId);
    
    void deleteByConversationId(String conversationId);
    
    void deleteByUserId(Long userId);
}

