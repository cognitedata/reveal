import React from 'react';
import { Modal } from 'antd';
import { getContainer } from 'src/utils';
import styled from 'styled-components';
import { AnnotationSettingsModalContent } from './AnnotationSettingsModalContent';

export type AnnotationSettingsModalProps = {
  showModal: boolean;
  onCancel: () => void;
  options?: {
    createNew: { text?: string; color?: string };
    activeView: 'keypoint' | 'shape';
  };
};

export const AnnotationSettingsModal = (
  props: AnnotationSettingsModalProps
) => {
  return (
    <StyledModal
      getContainer={getContainer}
      visible={props.showModal}
      onCancel={props.onCancel}
      width={580}
      footer={null} // to remove default ok and cancel buttons
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '10px',
        padding: '23px 18px',
        maxHeight: '710px',
        display: 'inline-table',
      }}
      destroyOnClose
    >
      <AnnotationSettingsModalContent
        onCancel={props.onCancel}
        options={props.options}
      />
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 10px;
  }
`;
