import React from 'react';

import { Modal } from 'antd';

import { getContainer } from '../../../../utils';

import { FileDownloaderModalContent } from './FileDownloaderModalContent';
import { FileDownloaderModalProps } from './types';

export const FileDownloaderModal = (props: FileDownloaderModalProps) => {
  return (
    <Modal
      getContainer={getContainer}
      open={props.showModal}
      onCancel={props.onCancel}
      width={800}
      footer={null} // to remove default ok and cancel buttons
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '5px',
        padding: '28px',
      }}
    >
      <FileDownloaderModalContent {...props} />
    </Modal>
  );
};
