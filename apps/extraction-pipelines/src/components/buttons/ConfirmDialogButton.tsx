import { Button, ButtonType, Popconfirm } from '@cognite/cogs.js';
import React, { ReactNode } from 'react';

export interface ConfirmDialogButtonProps {
  onClick: () => void;
  // eslint-disable-next-line
  type?: ButtonType;
  // eslint-disable-next-line
  cancelText?: string;
  // eslint-disable-next-line
  okText?: string;
  // eslint-disable-next-line
  popConfirmContent?: string;
  // eslint-disable-next-line
  primaryText?: string | ReactNode;
  // eslint-disable-next-line
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
