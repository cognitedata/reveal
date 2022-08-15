import { Button, ButtonType, Popconfirm } from '@cognite/cogs.js';
import React, { ReactNode } from 'react';

export interface ConfirmDialogButtonProps {
  onClick: () => void;
  type?: ButtonType;
  cancelText?: string;
  okText?: string;
  popConfirmContent?: string;
  primaryText?: string | ReactNode;
  testId?: string;
}
export const ConfirmDialogButton = ({
  onClick,
  cancelText = 'Cancel',
  okText = 'Confirm',
  popConfirmContent,
  primaryText,
  type,
  testId = 'confirm-dialog-btn',
}: ConfirmDialogButtonProps) => {
  return (
    <Popconfirm
      onConfirm={onClick}
      cancelText={cancelText}
      okText={okText}
      content={popConfirmContent}
      placement="top"
      icon="Warning"
    >
      <Button type={type} data-testid={testId}>
        {primaryText}
      </Button>
    </Popconfirm>
  );
};
