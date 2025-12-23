import axios from 'axios';
import { buildApiUrl } from './apiConfig';
import authHeader from './authHeader';

const CHAT_HISTORY_API_URL = buildApiUrl('/v1/chat-history');

const chatHistoryApiService = {
  /**
   * Get all conversations for current user
   * @returns {Promise<Array>} Array of conversation objects
   */
  async getAllConversations() {
    const headers = {
      ...authHeader(),
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.get(
        `${CHAT_HISTORY_API_URL}/conversations`,
        { headers }
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  /**
   * Get a specific conversation by ID
   * @param {string} conversationId
   * @returns {Promise<Object>} Conversation object
   */
  async getConversation(conversationId) {
    const headers = {
      ...authHeader(),
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.get(
        `${CHAT_HISTORY_API_URL}/conversations/${conversationId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  /**
   * Save or update a conversation
   * @param {string} conversationId
   * @param {Array} messages
   * @param {string} title
   * @returns {Promise<Object>} Saved conversation object
   */
  async saveConversation(conversationId, messages, title = null) {
    const headers = {
      ...authHeader(),
      'Content-Type': 'application/json'
    };

    const payload = {
      conversationId,
      messages,
      title
    };

    try {
      // Check if conversation exists
      try {
        await this.getConversation(conversationId);
        // If exists, update it
        const response = await axios.put(
          `${CHAT_HISTORY_API_URL}/conversations/${conversationId}`,
          payload,
          { headers }
        );
        return response.data;
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 500) {
          // If not found, create new
          const response = await axios.post(
            `${CHAT_HISTORY_API_URL}/conversations`,
            payload,
            { headers }
          );
          return response.data;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  },

  /**
   * Delete a conversation
   * @param {string} conversationId
   * @returns {Promise<void>}
   */
  async deleteConversation(conversationId) {
    const headers = {
      ...authHeader(),
      'Content-Type': 'application/json'
    };

    try {
      await axios.delete(
        `${CHAT_HISTORY_API_URL}/conversations/${conversationId}`,
        { headers }
      );
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  /**
   * Delete all conversations for current user
   * @returns {Promise<void>}
   */
  async deleteAllConversations() {
    const headers = {
      ...authHeader(),
      'Content-Type': 'application/json'
    };

    try {
      await axios.delete(
        `${CHAT_HISTORY_API_URL}/conversations`,
        { headers }
      );
    } catch (error) {
      console.error('Error deleting all conversations:', error);
      throw error;
    }
  }
};

export default chatHistoryApiService;

