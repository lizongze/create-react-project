import { OpenAiKey } from '@constants';
import axios from 'axios';

export const instanceForChatAiWithMemo = axios.create({
  withCredentials: false,
  timeout: 5000,
  headers: {
    // apiKey: OpenAiKey,
    // dangerouslyAllowBrowser: true,
    Authorization: `Bearer ${OpenAiKey}`,
    // Authorization: `Bearer <OPENROUTER_API_KEY>`,
    // 'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    // 'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
});
