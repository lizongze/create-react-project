import { DEBUG } from '@constants';
import { axiosWithMemoAi } from './axiosWithMemoAi';
import { instanceForChatAiWithMemo } from './instanceForChatAiWithMemo';
import {
  responeseInterceptorForMemoAi,
  requestInterceptorForMemoAi,
} from './interceptorForMemorize';

// 添加请求拦截器
instanceForChatAiWithMemo.interceptors.request.use(requestInterceptorForMemoAi);

// 添加响应拦截器
// instanceForChatAiWithMemo.interceptors.response
//   .use(responeseInterceptorForMemoAi);

instanceForChatAiWithMemo.interceptors.response.use(
  responeseInterceptorForMemoAi,
  DEBUG
    ? errorMock
    : (error) => {
      throw error;
    },
);

export const axiosForOpenAiWithMemo = instanceForChatAiWithMemo;

export default axiosWithMemoAi;

const mock = {
  id: 'gen-12345',
  choices: [
    {
      message: {
        role: 'assistant',
        content: 'The meaning of life is a complex and subjective question...',
      },
    },
  ],
};

const mock1 = {
  id: 'gen-1747699379-VzPLnuROyiiZgCVcPq3t',
  provider: 'DeepInfra',
  model: 'mistralai/mistral-7b-instruct:free',
  object: 'chat.completion',
  created: 1747699379,
  choices: [
    {
      logprobs: null,
      finish_reason: 'stop',
      native_finish_reason: 'stop',
      index: 0,
      message: {
        role: 'assistant',
        content:
          " Earlier, you asked for the weather forecast on the 0th and 1st days. Specifically, you asked about the weather today, but I reminded you that I don't have real-time data for weather forecasts and recommended checking a weather service instead. ☃️",
        refusal: null,
        reasoning: null,
      },
    },
  ],
  usage: {
    prompt_tokens: 596,
    completion_tokens: 59,
    total_tokens: 655,
  },
};

function errorMock({ config }) {
  responeseInterceptorForMemoAi({ data: mock1, config });
  return mock1;
}
