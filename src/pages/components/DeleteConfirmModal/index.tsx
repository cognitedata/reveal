import React, { useState } from 'react';
import { Body, Button, Checkbox, Colors, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import Modal, { ModalProps } from '../Modal/index';
import { useTranslation } from 'common/i18n';

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
  const { t } = useTranslation();
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
            {t('cancel')}
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
          {t('delete-modal-confirm-message-1', { confirmMessage })}{' '}
          <b>{t('delete-modal-confirm-message-2')}</b>{' '}
          {t('delete-modal-confirm-message-3')}
        </StyledDeleteTableModalBody>
        <StyledConfirmCheckboxWrapper>
          <StyledConfirmCheckbox
            checked={isConfirmed}
            name="confirm-delete-service-accounts"
            onChange={handleConfirmCheckboxChange}
          >
            {t('confirm-allow-delete', { confirmMessage })}
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
