import React, { ReactNode } from 'react';

import { Button, ButtonProps, Popconfirm } from '@cognite/cogs.js';

import { useTranslation } from '../../common';

export interface ConfirmDialogButtonProps {
  onClick: () => void;
  type?: ButtonProps['type'];
  cancelText?: string;
  okText?: string;
  popConfirmContent?: string;
  primaryText?: string | ReactNode;
  testId?: string;
}
export const ConfirmDialogButton = (props: ConfirmDialogButtonProps) => {
  const { t } = useTranslation();
  const {
    onClick,
    cancelText = t('cancel'),
    okText = t('confirm'),
    popConfirmContent,
    primaryText,
    type,
    testId = 'confirm-dialog-btn',
  } = props;

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
