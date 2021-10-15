import React from 'react';
import { Modal } from 'antd';
import { getContainer } from 'src/utils';
import { CollectionSettingsModalContent } from './CollectionSettingsModalContent';

export type CollectionSettingsModalProps = {
  showModal: boolean;
  onCancel: () => void;
};

export const CollectionSettingsModal = (
  props: CollectionSettingsModalProps
) => {
  return (
    <Modal
      getContainer={getContainer}
      visible={props.showModal}
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
      <CollectionSettingsModalContent onCancel={props.onCancel} />
    </Modal>
  );
};
