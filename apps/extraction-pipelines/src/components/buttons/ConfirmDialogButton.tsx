import { Button, Popconfirm } from '@cognite/cogs.js';
import React, { ReactNode } from 'react';
import { ButtonType } from '@cognite/cogs.js/dist/Atoms/Button/Button';

export interface ConfirmDialogButtonProps {
  onClick: () => void;
  // eslint-disable-next-line react/require-default-props
  type?: ButtonType;
  // eslint-disable-next-line react/require-default-props
  cancelText?: string;
  // eslint-disable-next-line react/require-default-props
  okText?: string;
  // eslint-disable-next-line react/require-default-props
  popConfirmContent?: string;
  // eslint-disable-next-line react/require-default-props
  primaryText?: string | ReactNode;
  // eslint-disable-next-line react/require-default-props
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
