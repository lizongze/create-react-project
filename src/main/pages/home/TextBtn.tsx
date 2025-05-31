import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { useDeferredValue } from 'react';
import { homeStore } from './homeStore';
import * as styles from './TextBtn.scss';

export const TextBtn = observer(({ onClick, value, className, label = '提问' }) => {
  const handleClick = () => {
    // onClick(data)
    const {
      // chatList,
      textValue,
    } = homeStore;

    onClick(textValue);
    // chatList.push()
  };

  const { textValue } = homeStore;
  // const deferValue = useDeferredValue(textValue);
  const deferValue = textValue;
  const { flex, flexAuto, icon } = styles;
  return (
    <div className={classNames(flex, className)}>
      <TextField
        id="outlined-multiline-flexible"
        label={label}
        multiline
        maxRows={4}
        value={deferValue}
        onChange={(evt) => {
          const value = evt.target.value;
          homeStore.textValue = value;
        }}
        className={flexAuto}
      />
      <Button
        //   variant="contained"
        size={'large'}
        endIcon={<SendIcon className={icon} />}
        // className=''
        onClick={handleClick}
      />
    </div>
  );
});
