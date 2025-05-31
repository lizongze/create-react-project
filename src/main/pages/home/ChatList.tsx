import List from '@mui/material/List';
import { useRef, useEffect } from 'react';
import { ChatListItem, IChatListItem } from './ChatListItem';
import * as styles from './ChatList.scss';
import { homeStore } from './homeStore';

export const ChatList = ({ value = [] }: { value: IChatListItem[] }) => {
  const { container } = styles;
  const scrollerRef = useRef(0);
  useEffect(() => {
    homeStore.scrollerRef = scrollerRef;
    const ulEle = scrollerRef.current;
    const { scrollHeight, scrollTop } = ulEle;
    ulEle.scrollTo(scrollTop, scrollHeight);
    // temp1.scrollTo(temp1.scrollTop, 1154 )
    // console.log('scrollerRef.current', scrollerRef.current);
    // console.log('scrollerRef.innerHeight', ulEle.innerHeight);
  }, [value]);
  return (
    <List className={container} ref={scrollerRef}>
      {value.map((item: IChatListItem, idx) => (
        <ChatListItem {...item} key={idx} />
      ))}
    </List>
  );
};
