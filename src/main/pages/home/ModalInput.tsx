import Modal from '@mui/material/Modal';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { TextBtn } from './TextBtn';
import { homeStore } from './homeStore';
import * as styles from './ModalInput.scss';

const handleClose = action(() => {
  console.log('handleClose');
  homeStore.isModalOpen = false;
});

export const ModalInput = observer(({ value, onChange }) => {
  const { isModalOpen } = homeStore;

  const { flexTop } = styles;

  return (
    <Modal
      open={isModalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <TextBtn
        className={flexTop}
        label={'openAI api key (or use the default key)'}
        onClick={(value) => {
          homeStore.isModalOpen = false;
          if (value) {
            homeStore.curOpenAiKey = value;
          }
          homeStore.textValue = '';
        }}
      />
    </Modal>
  );
});
