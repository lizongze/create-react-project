import { DEBUG } from '@constants';
const domain = DEBUG ? 'http://openrouter.aitest' : 'https://openrouter.ai';

export const openAiApi = `${domain}/api/v1/chat/completions`;
