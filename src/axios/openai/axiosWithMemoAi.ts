import { openAiApi } from '@api';
import { instanceForChatAiWithMemo } from './instanceForChatAiWithMemo';
import { ChatAiModel } from '@constants';

// N.B: 手动实现记忆功能：（给AI提示，让它学会记忆）
// * 考虑用一个session store/内存也行，来存储历史消息；
// todo: 最好还需要有个压缩模型来将会话列表压缩一下
// const messages = [
//   {"role": "system", "content": "You are a helpful assistant that remembers previous conversations."},
//   {"role": "user", "content": "What's the weather like today?"},
//   {"role": "assistant", "content": "I don't have real-time data, but you can check a weather service."},
//   {"role": "user", "content": "What did I ask earlier?"}
//   //# The model will recall the previous question
// ]

export const axiosWithMemoAi = (messages, OpenAiKey) =>
  instanceForChatAiWithMemo.post(
    openAiApi,
    {
      model: ChatAiModel,
      messages: [].concat(messages).filter((v) => v),
    },
    {
      headers: {
        Authorization: `Bearer ${OpenAiKey}`,
      },
    },
  );
