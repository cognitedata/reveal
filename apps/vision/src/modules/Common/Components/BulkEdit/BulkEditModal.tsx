import React from 'react';
import { Modal } from 'antd';
import { getContainer } from 'src/utils';
import {
  BulkEditModalContent,
  BulkEditModalContentProps,
} from './BulkEditModalContent';

export const BulkEditModal = ({
  showModal,
  onCancel,
  ...props
}: {
  showModal: boolean;
} & BulkEditModalContentProps) => {
  return (
    <Modal
      getContainer={getContainer}
      visible={showModal}
      onCancel={onCancel}
      width={780}
      footer={null} // to remove default ok and cancel buttons
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '5px',
        padding: '28px',
        maxHeight: '725px',
      }}
    >
      <BulkEditModalContent onCancel={onCancel} {...props} />
    </Modal>
  );
};
