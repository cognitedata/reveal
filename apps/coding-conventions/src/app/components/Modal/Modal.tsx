import React from 'react';
import { Modal as CogsModal, ModalProps } from '@cognite/cogs.js';
import styled from 'styled-components';
import { getContainer } from '../../../GlobalStyles';

const CustomModal = styled(CogsModal)<{
  $modalWidth?: string;
  $modalHeight?: string;
}>`
  width: ${({ $modalWidth }) => $modalWidth || '95%'} !important;
  margin: 1rem auto;
  height: ${({ $modalHeight }) => $modalHeight || '95%'};
  overflow: hidden;
  padding: 0 !important;

  border-radius: 10px !important;

  display: flex;
  flex-direction: column;

  .cogs-modal-close {
    top: 6px !important;
    right: 6px !important;
    opacity: 0.5;
    cursor: pointer;
  }

  .cogs-modal-header {
    font-size: 18px;
    font-weight: 600;
    color: var(--cogs-greyscale-grey9);
    border-bottom: none;
  }

  .cogs-modal-content {
    overflow-y: auto;
    height: 100%;
    padding: 16px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .cogs-modal-close {
    color: black;
    top: 20px;
    right: 8px;
  }

  .cogs-modal-footer {
    display: flex;
    justify-content: flex-end;
    background-color: white;
    bottom: 0;
    width: 100%;
    border: none;
  }

  .cogs-modal-footer .cogs-btn-secondary {
    background-color: transparent;
  }
  .cogs-table tr:nth-child(2n) {
    background: white;

    &:hover {
      background: var(--cogs-greyscale-grey2);
    }
  }
  .cogs-table th {
    background: white;
  }
`;

interface Props extends ModalProps {
  modalHeight?: string;
  modalWidth?: string;
}

export const Modal: React.FC<Props> = ({
  children,
  modalHeight,
  modalWidth,
  ...rest
}) => {
  return (
    <CustomModal
      $modalWidth={modalWidth}
      $modalHeight={modalHeight}
      getContainer={getContainer}
      appElement={document.body}
      {...rest}
    >
      {children}
    </CustomModal>
  );
};
