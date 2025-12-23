import LocalStorage from '../infrastructure/storage/localStorage';

const CHAT_HISTORY_KEY = 'ai_assistant_chat_history';
const CURRENT_CONVERSATION_KEY = 'ai_assistant_current_conversation';
const MAX_HISTORY_ITEMS = 50; // Giới hạn số lượng conversation lưu trữ

/**
 * Chat History Service
 * Manages chat conversation history using localStorage
 */
class ChatHistoryService {
  /**
   * Get all chat histories
   * @returns {Array} Array of conversation objects
   */
  getAllHistories() {
    const histories = LocalStorage.get(CHAT_HISTORY_KEY) || [];
    // Sort by updatedAt descending (newest first)
    return histories.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Get a specific conversation by ID
   * @param {string} conversationId
   * @returns {Object|null} Conversation object or null
   */
  getConversation(conversationId) {
    const histories = this.getAllHistories();
    return histories.find(h => h.id === conversationId) || null;
  }

  /**
   * Save or update a conversation
   * @param {string} conversationId - ID of the conversation
   * @param {Array} messages - Array of message objects
   * @param {string} title - Optional title for the conversation
   * @returns {Object} Saved conversation object
   */
  saveConversation(conversationId, messages, title = null) {
    const histories = this.getAllHistories();
    const existingIndex = histories.findIndex(h => h.id === conversationId);
    
    // Generate title from first user message if not provided
    if (!title) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      title = firstUserMessage 
        ? firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '')
        : 'New Conversation';
    }

    const conversation = {
      id: conversationId,
      title,
      messages,
      createdAt: existingIndex >= 0 ? histories[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: messages.filter(m => m.role === 'user' || m.role === 'assistant').length
    };

    if (existingIndex >= 0) {
      // Update existing conversation
      histories[existingIndex] = conversation;
    } else {
      // Add new conversation
      histories.unshift(conversation);
      // Limit the number of stored conversations
      if (histories.length > MAX_HISTORY_ITEMS) {
        histories.splice(MAX_HISTORY_ITEMS);
      }
    }

    LocalStorage.set(CHAT_HISTORY_KEY, histories);
    return conversation;
  }

  /**
   * Delete a conversation
   * @param {string} conversationId
   * @returns {boolean} Success status
   */
  deleteConversation(conversationId) {
    const histories = this.getAllHistories();
    const filtered = histories.filter(h => h.id !== conversationId);
    LocalStorage.set(CHAT_HISTORY_KEY, filtered);
    return filtered.length < histories.length;
  }

  /**
   * Delete all conversations
   * @returns {boolean} Success status
   */
  deleteAllConversations() {
    LocalStorage.set(CHAT_HISTORY_KEY, []);
    return true;
  }

  /**
   * Get current active conversation ID
   * @returns {string|null}
   */
  getCurrentConversationId() {
    return LocalStorage.getString(CURRENT_CONVERSATION_KEY);
  }

  /**
   * Set current active conversation ID
   * @param {string} conversationId
   */
  setCurrentConversationId(conversationId) {
    if (conversationId) {
      LocalStorage.setString(CURRENT_CONVERSATION_KEY, conversationId);
    } else {
      LocalStorage.remove(CURRENT_CONVERSATION_KEY);
    }
  }

  /**
   * Generate a new conversation ID
   * @returns {string}
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get conversation statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const histories = this.getAllHistories();
    return {
      totalConversations: histories.length,
      totalMessages: histories.reduce((sum, h) => sum + h.messageCount, 0),
      oldestConversation: histories.length > 0 ? histories[histories.length - 1].createdAt : null,
      newestConversation: histories.length > 0 ? histories[0].createdAt : null
    };
  }
}

export default new ChatHistoryService();
