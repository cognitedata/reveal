import React from 'react';

import { getContainer } from '@vision/utils';
import { Modal } from 'antd';

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
      destroyOnClose
      getContainer={getContainer}
      open={props.showModal}
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
