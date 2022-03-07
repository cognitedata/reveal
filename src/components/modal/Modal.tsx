import React from 'react';
import { Modal as CogsModal, ModalProps } from '@cognite/cogs.js';
import { getContainer } from 'src/utils/utils';
import styled from 'styled-components';

const CustomModal = styled(CogsModal)<{ $modalSize?: string }>`
  width: ${({ $modalSize }) => $modalSize || '95%'} !important;
  margin: 1rem auto;
  height: ${({ $modalSize }) => $modalSize || '95%'};
  overflow: hidden;
  padding: 0;

  display: flex;
  flex-direction: column;

  .cogs-modal-close {
    top: 24px;
    right: 24px;
    opacity: 0.5;
    cursor: pointer;
  }

  .cogs-modal-header {
    font-size: 18px;
    font-weight: 600;
    color: var(--cogs-greyscale-grey9);
  }

  .cogs-modal-content {
    overflow-y: scroll;
    margin-bottom: 4.25rem;
    height: 100%;
    padding-top: 0;
  }

  .cogs-modal-footer {
    background-color: white;
    position: absolute;
    bottom: 0;
    width: 100%;
    border: none;
    box-shadow: -10px -2px 6px rgba(0, 0, 0, 0.08);
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
  modalSize?: string;
}

export const Modal: React.FC<Props> = ({ children, modalSize, ...rest }) => {
  return (
    <CustomModal
      $modalSize={modalSize}
      getContainer={getContainer}
      appElement={document.body}
      {...rest}
    >
      {children}
    </CustomModal>
  );
};
