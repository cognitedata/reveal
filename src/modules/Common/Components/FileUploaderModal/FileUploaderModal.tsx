import React from 'react';
import { Modal } from 'antd';
import { getContainer } from 'src/utils';
import {
  ModalFileUploader,
  ModalFileUploaderProps,
} from './ModalFileUploader/ModalFileUploader';

export type FileUploadModalProps = ModalFileUploaderProps & {
  showModal: boolean;
  onCancel: () => void;
};

export const FileUploadModal = (props: FileUploadModalProps) => {
  return (
    <Modal
      getContainer={getContainer}
      visible={props.showModal}
      onCancel={props.onCancel}
      width={1000}
      footer={null} // to remove default ok and cancel buttons
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '5px',
        padding: '28px',
      }}
    >
      <ModalFileUploader {...props} />
    </Modal>
  );
};
