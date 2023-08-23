/* eslint-disable @cognite/no-number-z-index */
import React from 'react';

import styled from 'styled-components';

import { Modal as CogsModal, ModalDefaultProps } from '@cognite/cogs.js';

import { getContainer } from '../../../GlobalStyles';

const CustomModal = styled(CogsModal)<{
  $modalWidth?: string;
  $modalHeight?: string;
  $modalMaxHeight?: string;
}>`
  width: ${({ $modalWidth }) => $modalWidth || '95%'} !important;
  margin: 1rem auto;
  ${({ $modalHeight }) => $modalHeight && `height: ${$modalHeight};`};
  ${({ $modalMaxHeight }) =>
    $modalMaxHeight && `max-height: ${$modalMaxHeight};`}
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
    overflow: inherit;

    .cogs-modal-title-container {
      overflow: inherit;

      .cogs-modal-title {
        overflow: inherit;
      }
    }
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

interface Props extends ModalDefaultProps {
  modalHeight?: string;
  modalWidth?: string;
  modalMaxHeight?: string;
}

export const Modal: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  modalHeight,
  modalMaxHeight,
  modalWidth,
  ...rest
}) => {
  return (
    <CustomModal
      $modalWidth={modalWidth}
      $modalHeight={modalHeight}
      $modalMaxHeight={modalMaxHeight}
      getContainer={getContainer}
      {...rest}
    >
      {children}
    </CustomModal>
  );
};
