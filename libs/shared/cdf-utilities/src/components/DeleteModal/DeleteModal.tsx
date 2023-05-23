import React, { useState } from 'react';
import { Button, ButtonProps, Checkbox } from '@cognite/cogs.js';
import styled from 'styled-components';

import Modal, { ModalProps } from '../Modal/Modal';

const StyledFooterContainer = styled.div`
  button:not(:last-child) {
    margin-right: 8px;
  }
`;

const StyledBodyText = styled.div`
  margin-bottom: 10px;
`;

export type DeleteModalProps = {
  bodyText: string;
  cancelButtonProps?: ButtonProps;
  checkboxLabel: string;
  loading?: boolean;
  okButtonProps?: ButtonProps;
  okType?: string;
} & Omit<ModalProps, 'children' | 'footer' | 'okType'>;

const DeleteModal = ({
  bodyText,
  cancelButtonProps,
  cancelText = 'Cancel',
  checkboxLabel,
  loading = false,
  okButtonProps,
  okText = 'Delete',
  okType = 'destructive',
  onOk,
  ...props
}: DeleteModalProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const footer = (
    <StyledFooterContainer>
      <Button
        type="ghost"
        onClick={props.onCancel}
        disabled={loading}
        {...cancelButtonProps}
      >
        {cancelText}
      </Button>
      <Button
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        type={okType}
        disabled={!isConfirmed}
        onClick={onOk}
        loading={loading}
        {...okButtonProps}
      >
        {okText}
      </Button>
    </StyledFooterContainer>
  );

  return (
    <Modal {...props} footer={footer}>
      <StyledBodyText>{bodyText}</StyledBodyText>
      <Checkbox
        checked={isConfirmed}
        name="confirmDelete"
        onChange={(e) => setIsConfirmed(e.target.checked)}
      >
        {checkboxLabel}
      </Checkbox>
    </Modal>
  );
};

export default DeleteModal;
