import LocalStorage from '../infrastructure/storage/localStorage';
import chatHistoryApiService from './chatHistoryApiService';

const CHAT_HISTORY_KEY = 'ai_assistant_chat_history';
const CURRENT_CONVERSATION_KEY = 'ai_assistant_current_conversation';
const MAX_HISTORY_ITEMS = 50; // Giới hạn số lượng conversation lưu trữ
const SYNC_ENABLED = true; // Enable/disable backend sync

/**
 * Chat History Service
 * Manages chat conversation history using localStorage and backend API (hybrid approach)
 */
class ChatHistoryService {
  /**
   * Get all chat histories
   * @param {boolean} useBackend - Whether to fetch from backend (default: true)
   * @returns {Promise<Array>|Array} Array of conversation objects
   */
  async getAllHistories(useBackend = true) {
    if (SYNC_ENABLED && useBackend) {
      try {
        const backendHistories = await chatHistoryApiService.getAllConversations();
        // Sync to localStorage as backup
        if (backendHistories && backendHistories.length > 0) {
          const formattedHistories = backendHistories.map(conv => ({
            id: conv.conversationId,
            title: conv.title,
            messages: conv.messages || [],
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            messageCount: conv.messageCount || 0
          }));
          LocalStorage.set(CHAT_HISTORY_KEY, formattedHistories);
          return formattedHistories.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
      } catch (error) {
        console.warn('Failed to fetch from backend, using localStorage:', error);
        // Fallback to localStorage
      }
    }
    
    const histories = LocalStorage.get(CHAT_HISTORY_KEY) || [];
    // Sort by updatedAt descending (newest first)
    return histories.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Get a specific conversation by ID
   * @param {string} conversationId
   * @param {boolean} useBackend - Whether to fetch from backend (default: true)
   * @returns {Promise<Object|null>|Object|null} Conversation object or null
   */
  async getConversation(conversationId, useBackend = true) {
    if (SYNC_ENABLED && useBackend) {
      try {
        const backendConv = await chatHistoryApiService.getConversation(conversationId);
        if (backendConv) {
          return {
            id: backendConv.conversationId,
            title: backendConv.title,
            messages: backendConv.messages || [],
            createdAt: backendConv.createdAt,
            updatedAt: backendConv.updatedAt,
            messageCount: backendConv.messageCount || 0
          };
        }
      } catch (error) {
        console.warn('Failed to fetch conversation from backend, using localStorage:', error);
        // Fallback to localStorage
      }
    }
    
    const histories = await this.getAllHistories(false);
    return histories.find(h => h.id === conversationId) || null;
  }

  /**
   * Save or update a conversation
   * @param {string} conversationId - ID of the conversation
   * @param {Array} messages - Array of message objects
   * @param {string} title - Optional title for the conversation
   * @returns {Promise<Object>|Object} Saved conversation object
   */
  async saveConversation(conversationId, messages, title = null) {
    const histories = await this.getAllHistories(false);
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

    // Save to localStorage first (for immediate access)
    LocalStorage.set(CHAT_HISTORY_KEY, histories);

    // Sync to backend (async, don't wait)
    if (SYNC_ENABLED) {
      chatHistoryApiService.saveConversation(conversationId, messages, title)
        .then(async (backendConv) => {
          // Update localStorage with backend data if successful
          if (backendConv) {
            const updatedHistories = await this.getAllHistories(false);
            const idx = updatedHistories.findIndex(h => h.id === conversationId);
            if (idx >= 0) {
              updatedHistories[idx] = {
                ...updatedHistories[idx],
                createdAt: backendConv.createdAt,
                updatedAt: backendConv.updatedAt
              };
              LocalStorage.set(CHAT_HISTORY_KEY, updatedHistories);
            }
          }
        })
        .catch(error => {
          console.warn('Failed to sync conversation to backend:', error);
          // Continue with localStorage version
        });
    }

    return conversation;
  }

  /**
   * Delete a conversation
   * @param {string} conversationId
   * @returns {Promise<boolean>|boolean} Success status
   */
  async deleteConversation(conversationId) {
    const histories = await this.getAllHistories(false);
    const filtered = histories.filter(h => h.id !== conversationId);
    LocalStorage.set(CHAT_HISTORY_KEY, filtered);
    
    // Delete from backend
    if (SYNC_ENABLED) {
      chatHistoryApiService.deleteConversation(conversationId)
        .catch(error => {
          console.warn('Failed to delete conversation from backend:', error);
        });
    }
    
    return filtered.length < histories.length;
  }

  /**
   * Delete all conversations
   * @returns {Promise<boolean>|boolean} Success status
   */
  async deleteAllConversations() {
    LocalStorage.set(CHAT_HISTORY_KEY, []);
    
    // Delete from backend
    if (SYNC_ENABLED) {
      chatHistoryApiService.deleteAllConversations()
        .catch(error => {
          console.warn('Failed to delete all conversations from backend:', error);
        });
    }
    
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
   * @param {boolean} useBackend - Whether to fetch from backend (default: true)
   * @returns {Promise<Object>|Object} Statistics object
   */
  async getStatistics(useBackend = true) {
    const histories = await this.getAllHistories(useBackend);
    return {
      totalConversations: histories.length,
      totalMessages: histories.reduce((sum, h) => sum + (h.messageCount || 0), 0),
      oldestConversation: histories.length > 0 ? histories[histories.length - 1].createdAt : null,
      newestConversation: histories.length > 0 ? histories[0].createdAt : null
    };
  }

  /**
   * Sync all conversations from backend to localStorage
   * @returns {Promise<void>}
   */
  async syncFromBackend() {
    if (!SYNC_ENABLED) return;
    
    try {
      const backendHistories = await chatHistoryApiService.getAllConversations();
      if (backendHistories && backendHistories.length > 0) {
        const formattedHistories = backendHistories.map(conv => ({
          id: conv.conversationId,
          title: conv.title,
          messages: conv.messages || [],
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.messageCount || 0
        }));
        LocalStorage.set(CHAT_HISTORY_KEY, formattedHistories);
      }
    } catch (error) {
      console.error('Failed to sync from backend:', error);
      throw error;
    }
  }
}

export default new ChatHistoryService();
