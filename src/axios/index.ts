import axios from 'axios';

const instance = axios.create({
  withCredentials: true,
  timeout: 3 * 60 * 1000,
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const response = error.response;

    //Network Error为 axios 在网络有问题的时候返回的字符串
    if (error && error.message === 'Network Error') {
      const errorMsg = '网络不给力, 请检查网络连接';
      return Promise.reject(new Error(errorMsg));
    }
    // 如果是被cancel掉的 是没有response的，手工生事项会cancel掉请求
    if (axios.isCancel(error)) {
      return Promise.reject('Request canceled');
    }

    // 401 未经验证的用户
    if (response.status === 401) {
      // return loginResender.append(response.config);

      // if (!response.config.onlyOne) {
      //   return loginResender.append(Object.assign({}, response.config, { onlyOne: true }));
      // } else {
      return Promise.reject(new Error('登录失效，请重新登录'));
      // }
    }

    throw error;
  },
);

export default instance;
