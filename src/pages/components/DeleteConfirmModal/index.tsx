import React, { useState } from 'react';
import { Body, Button, Checkbox, Colors, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import Modal, { ModalProps } from '../Modal/index';
import { CANCEL } from 'utils/constants';

type DeleteTableModalProps = {
  isOpen: boolean;
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel: string;
  onConfirm: () => void;
} & Omit<ModalProps, 'children' | 'title'>;

const DeleteConfirmModal = ({
  isOpen,
  confirmTitle,
  confirmMessage,
  confirmLabel,
  onConfirm,
  onCancel,
  ...modalProps
}: DeleteTableModalProps): JSX.Element => {
  const [isConfirmed, setIsConfirmed] = useState(isOpen);

  const handleDelete = (): void => {
    onConfirm();
  };

  const handleClose = (): void => {
    setIsConfirmed(false);
    onCancel();
  };

  const handleConfirmCheckboxChange = (isChecked: boolean): void => {
    setIsConfirmed(isChecked);
  };

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Modal
        visible={isOpen}
        footer={[
          <StyledCancelButton onClick={handleClose} type="ghost">
            {CANCEL}
          </StyledCancelButton>,
          <Button disabled={!isConfirmed} onClick={handleDelete} type="danger">
            {confirmLabel}
          </Button>,
        ]}
        onCancel={handleClose}
        title={
          <StyledDeleteTableModalTitle level={5}>
            {confirmTitle}
          </StyledDeleteTableModalTitle>
        }
        {...modalProps}
      >
        <StyledDeleteTableModalBody level={2}>
          Are you sure you want to {confirmMessage}? You will lose all of the
          data, and <b>will not</b> be able to restore it later.
        </StyledDeleteTableModalBody>
        <StyledConfirmCheckboxWrapper>
          <StyledConfirmCheckbox
            checked={isConfirmed}
            name="confirm-delete-service-accounts"
            onChange={handleConfirmCheckboxChange}
          >
            Yes, I'm sure I want to {confirmMessage}
          </StyledConfirmCheckbox>
        </StyledConfirmCheckboxWrapper>
      </Modal>
    </span>
  );
};

const StyledDeleteTableModalBody = styled(Body)`
  color: ${Colors['text-primary'].hex()};
`;

const StyledCancelButton = styled(Button)`
  margin-right: 8px;
`;

const StyledDeleteTableModalTitle = styled(Title)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 312px;
`;

const StyledConfirmCheckboxWrapper = styled.div`
  display: flex;
  margin-top: 16px;
`;

const StyledConfirmCheckbox = styled(Checkbox)`
  margin-right: 8px;
`;

export default DeleteConfirmModal;
