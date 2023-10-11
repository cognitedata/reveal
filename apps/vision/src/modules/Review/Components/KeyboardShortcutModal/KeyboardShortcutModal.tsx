import React from 'react';

import { Modal } from 'antd';

import { getContainer } from '../../../../utils';

import { KeyboardShortcutModalContent } from './KeyboardShortcutModalContent';

export type KeyboardShortcutModalProps = {
  showModal: boolean;
  onCancel: () => void;
};

export const KeyboardShortcutModal = (props: KeyboardShortcutModalProps) => {
  return (
    <Modal
      getContainer={getContainer}
      open={props.showModal}
      onCancel={props.onCancel}
      width={680}
      footer={null} // to remove default ok and cancel buttons
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '5px',
        padding: '23px 18px',
        maxHeight: '710px',
      }}
    >
      <KeyboardShortcutModalContent />
    </Modal>
  );
};
