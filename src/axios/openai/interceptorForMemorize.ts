type IconversionItem = {
  role: 'user' | 'system' | 'assistant' | 'developer' | 'tool';
  content: string;
};

// const messages = [
//   {'role': 'system', 'content': 'You are a helpful assistant that remembers previous conversations.'},
//   {'role': 'user', 'content': "What's the weather like today?"},
//   {'role': 'assistant', 'content': "I don't have real-time data, but you can check a weather service."},
// //   {"role": "user", "content": "What did I ask earlier?"}
//   //# The model will recall the previous question
// ]
const initItemForAI = {
  role: 'system',
  content: 'You are a helpful assistant that remembers previous conversations.',
};

export const conversionsHistory: IconversionItem[] = [].concat([
  initItemForAI,
  // { role: 'user', content: "What's the weather like today? 0" },
  // {
  //   role: 'assistant',
  //   content: "I don't have real-time data, but you can check a weather service 0.",
  // },
  // { role: 'user', content: "What's the weather like today? 1" },
  // {
  //   role: 'assistant',
  //   content: "I don't have real-time data, but you can check a weather service 1.",
  // },
]);

export const requestInterceptorForMemoAi = (config) => {
  // console.log("interceptor start : config", config);
  const { messages, ...restData } = config.data;
  const memorizedData = {
    ...restData,
    messages: [
      // initItemForAI,
      ...conversionsHistory,
      ...messages,
    ],
  };
  config.data = memorizedData;
  console.log('interceptor end : config', config);
  return config;
};

export const responeseInterceptorForMemoAi = (response) => {
  const { data, config } = response;
  const { choices = [] } = data;
  // todo: 获取config.data,一起push进conversionsHistory
  const curConfig = JSON.parse(config.data);
  const lastMsg = curConfig.messages.pop();
  if (choices.length > 0) {
    const curMsgs = choices.map(({ message }) => {
      const { content, role } = message;
      return { content, role };
    });
    conversionsHistory.push(lastMsg, ...curMsgs);
  }
  console.log('response', response);
  return response;
};
