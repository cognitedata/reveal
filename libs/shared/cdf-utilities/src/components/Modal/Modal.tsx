import React from 'react';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import { Modal as AntdModal, ModalProps as AntdModalProps } from 'antd';

import { ModalWidth } from '@cognite/cdf-utilities';
import 'antd/es/style/index.css';
import 'antd/es/modal/style/index.css';

// Source: https://stackoverflow.com/a/69328045
type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ModalProps = {
  children: React.ReactNode;
  size?: keyof typeof ModalWidth;
} & Omit<WithRequired<AntdModalProps, 'getContainer'>, 'closeIcon'>;

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
      max-height: calc(
        100vh - 332px
      ); /* 156px space on top and 176 px space on the bottom. The difference is about the sizes of buttons */
      overflow-y: auto;
      padding: 20px !important; /* overrides antd style */
    }
    .ant-modal-footer {
      border: none;
      padding: ${({ $hasFooter }) => $hasFooter && '20px 16px'};
    }
  }
`;

const Modal = ({ footer, size = 'small', ...modalProps }: ModalProps) => (
  <StyledModal
    $hasFooter={!!footer}
    closeIcon={<Icon type="CloseLarge" />}
    footer={footer}
    width={ModalWidth[size]}
    {...modalProps}
  />
);

export default Modal;
