import React, { ReactNode } from 'react';
import { Modal as AntdModal, ModalProps as AntdModalProps } from 'antd';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import { MODAL_WIDTH } from 'utils/constants';
import { getContainer } from 'utils/utils';
import { ZIndexLayer } from 'utils/zIndex';

export type ModalProps = {
  children: ReactNode;
  onCancel: () => void;
} & Omit<AntdModalProps, 'onCancel'>;

const Modal = ({ footer, ...modalProps }: ModalProps): JSX.Element => {
  return (
    <StyledModal
      $hasFooter={!!footer}
      closeIcon={<Icon type="CloseLarge" />}
      footer={footer}
      getContainer={getContainer}
      width={MODAL_WIDTH}
      zIndex={ZIndexLayer.Modal}
      {...modalProps}
    />
  );
};

const StyledModal = styled(AntdModal)<{ $hasFooter: boolean }>`
  .ant-modal-content {
    border-radius: 12px;

    .ant-modal-header {
      border-radius: 12px 12px 0 0;
      border: none;
      padding-left: 16px;
      padding-right: 16px;
    }

    .ant-modal-body {
      padding: 20px !important; /* overrides antd style */
    }

    .ant-modal-footer {
      border: none;
      padding: ${({ $hasFooter }) => $hasFooter && '20px 16px'};
    }
  }
`;

export default Modal;
