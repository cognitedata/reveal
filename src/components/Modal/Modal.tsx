import React, { ReactNode } from 'react';

import { Modal as AntdModal, ModalProps as AntdModalProps } from 'antd';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';

import { MODAL_WIDTH } from 'utils/constants';
import { getContainer } from 'utils/utils';

export type ModalProps = {
  children: ReactNode;
  onCancel: () => void;
} & Omit<AntdModalProps, 'onCancel'>;

const StyledModal = styled(AntdModal)`
  .ant-modal-content {
    border-radius: 12px;

    .ant-modal-header {
      border-radius: 12px 12px 0 0;
      padding-left: 16px;
      padding-right: 16px;
    }

    .ant-modal-body {
      padding: 16px !important; /* overrides antd style */
    }
  }
`;

const Modal = (props: ModalProps): JSX.Element => {
  return (
    <StyledModal
      closeIcon={<Icon type="LargeClose" />}
      getContainer={getContainer}
      width={MODAL_WIDTH}
      {...props}
    />
  );
};

export default Modal;
