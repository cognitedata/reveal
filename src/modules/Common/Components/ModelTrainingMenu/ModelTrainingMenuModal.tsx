import React from 'react';
import { Modal } from 'antd';
import { getContainer } from 'src/utils';
import {
  // ModelTrainingModalContent,
  ModelTrainingModalContentProps,
} from './ModelTrainingMenuModalContent';

export const ModelTrainingModal = ({
  showModal,
  onCancel,
}: // ...props
{
  showModal: boolean;
} & ModelTrainingModalContentProps) => {
  return (
    <Modal
      getContainer={getContainer}
      visible={showModal}
      onCancel={onCancel}
      width={780}
      footer={null} // to remove default ok and cancel buttons
      maskClosable={false}
      closable={false}
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '5px',
        padding: '28px',
        maxHeight: '665px',
      }}
    >
      {/* <ModelTrainingModalContent onCancel={onCancel} {...props} /> */}
    </Modal>
  );
};
