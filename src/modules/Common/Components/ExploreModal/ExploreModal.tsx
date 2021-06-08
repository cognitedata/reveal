import React from 'react';
import { Modal } from 'antd';
import { getContainer } from 'src/utils';
import {
  ExploreModalContent,
  ExploreModalContentProps,
} from './ExploreModalContent';

export type ExploreModalProps = ExploreModalContentProps & {
  showModal: boolean;
};

export const ExploreModal = (props: ExploreModalProps) => {
  return (
    <Modal
      getContainer={getContainer}
      visible={props.showModal}
      onCancel={props.onCloseModal}
      width={1000}
      footer={null} // to remove default ok and cancel buttons
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '5px',
        padding: '28px',
      }}
    >
      <ExploreModalContent {...props} />
    </Modal>
  );
};
