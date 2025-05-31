// import { OpenAiKey } from '@constants/index';
import axiosWithMemoAi from '@root/src/axios/openai';
// import { conversionsHistory } from '@root/src/axios/openai/interceptorForMemorize';
import { ChatList } from './ChatList';
import { observer } from 'mobx-react';
import { action } from 'mobx';

// import { useEffect } from 'react';
import { homeStore } from './homeStore';
import { TextBtn } from './TextBtn';
import * as styles from './Home.scss';
import { ModalInput } from './ModalInput';

// N.B: 手动实现记忆功能：（给AI提示，让它学会记忆）
// * 考虑用一个session store/内存也行，来存储历史消息；
// todo: 最好还需要有个压缩模型来将会话列表压缩一下
// const messages = [
//   {'role': 'system', 'content': 'You are a helpful assistant that remembers previous conversations.'},
//   {'role': 'user', 'content': "What's the weather like today?"},
//   {'role': 'assistant', 'content': "I don't have real-time data, but you can check a weather service."},
//   {'role': 'user', 'content': 'What did I ask earlier?'}
//   //# The model will recall the previous question
// ]

const messagesList = [{ role: 'user', content: 'What did I ask earlier?' }];

console.log('axiosWithMemoAi');

const { getOpenAiKey } = homeStore;

const fetchAI = (data) =>
  axiosWithMemoAi(data, getOpenAiKey()).then(
    action((resData) => {
      const { choices = [] } = resData.data;
      const { chatList } = homeStore;
      if (choices.length > 0) {
        const curMsgs = choices.map(({ message }) => message);
        // conversionsHistory.push(...curMsgs)
        chatList.push(...curMsgs);
      }
      console.log('chatList len', resData, chatList.length, chatList);
      return resData;
    }),
  );

const fmt = (list) =>
  list.map(({ role, content }) => ({
    kind: role,
    value: content,
  }));

export const Home = observer(() => {
  // conversionsHistory
  // const []
  const { chatList, isModalOpen } = homeStore;
  const data = fmt(chatList);
  console.log();

  // useEffect(() => {
  //   // fetchAI(messagesList);
  // }, []);

  const { flex } = styles;

  return isModalOpen ? (
    <ModalInput />
  ) : (
    <div className={flex}>
      <div>
        <ChatList value={data} />
      </div>
      <TextBtn
        onClick={(content) => {
          const value = {
            role: 'user',
            content,
          };
          const { chatList } = homeStore;
          fetchAI(value).then(() => {
            homeStore.textValue = '';
          });
          chatList.push(value);
        }}
      />
    </div>
  );
});
