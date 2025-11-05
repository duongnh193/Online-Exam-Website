import axios from 'axios';
import { buildApiUrl } from './apiConfig';
import authHeader from './authHeader';

const ASSISTANT_API_URL = buildApiUrl('/v1/assistant/chat');

const assistantService = {
  async askAssistant(payload) {
    const headers = {
      ...authHeader(),
      'Content-Type': 'application/json'
    };

    return axios.post(
      ASSISTANT_API_URL,
      payload,
      { headers, timeout: 20000 }
    );
  }
};

export default assistantService;
