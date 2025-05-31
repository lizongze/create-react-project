import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import classnames from 'classnames';
import * as styles from './ChatListItem.scss';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export type IChatListItem = {
  kind: string;
  value: string;
};

export const ChatListItem = (props: IChatListItem) => {
  const { kind, value } = props;
  const { flexRevert, flex, flexEnd, btnBg, paddingRight, flexCenter } = styles;

  return (
    <ListItem>
      <div className={classnames(flex, flexEnd, flexCenter)}>
        {kind === 'user' && (
          <ListItemText primary={value} className={classnames(flexRevert, btnBg)} />
        )}
        {kind !== 'user' && (
          <>
            <div className={paddingRight}>
              <SupportAgentIcon fontSize="large" />
            </div>
            <ListItemText primary={value} />
          </>
        )}
      </div>
    </ListItem>
  );
};
