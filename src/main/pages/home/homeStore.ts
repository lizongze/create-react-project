import { observable } from 'mobx';
import { OpenAiKey as defaultOpenAiKey } from '@constants';

class HomeStore {
  @observable
  public accessor chatList = [];
  @observable
  public accessor textValue = '';

  @observable
  public accessor isModalOpen = true;

  curOpenAiKey = '';

  getOpenAiKey = () => {
    return this.curOpenAiKey || defaultOpenAiKey;
  };
}

export const homeStore = new HomeStore();

// export const homeStore = observable({
//     chatList: [],
// })
