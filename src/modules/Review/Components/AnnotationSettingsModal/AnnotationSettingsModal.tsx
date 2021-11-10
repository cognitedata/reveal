import React from 'react';
import { Modal } from 'antd';
import { getContainer } from 'src/utils';
import { AnnotationSettingsModalContent } from './AnnotationSettingsModalContent';

export type AnnotationSettingsModalProps = {
  showModal: boolean;
  onCancel: () => void;
};

export const AnnotationSettingsModal = (
  props: AnnotationSettingsModalProps
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
      <AnnotationSettingsModalContent onCancel={props.onCancel} />
    </Modal>
  );
};
