import React, { ReactNode } from 'react';
import { Button, Popconfirm } from '@cognite/cogs.js';

interface ClosePopconfirmProps {
  showConfirmBox: boolean;
  onClick: () => void;
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

const ClosePopconfirm = ({
  onClick,
  cancelText = 'Cancel',
  okText = 'Confirm',
  popConfirmContent,
  primaryText,
  showConfirmBox,
  testId = 'close-modal-btn',
}: ClosePopconfirmProps) => {
  if (showConfirmBox) {
    return (
      <Popconfirm
        onConfirm={onClick}
        cancelText={cancelText}
        okText={okText}
        content={popConfirmContent}
        placement="top"
        icon="Warning"
      >
        <Button type="primary" data-testid={testId}>
          {primaryText}
        </Button>
      </Popconfirm>
    );
  }
  return (
    <Button type="primary" onClick={onClick} data-testid={testId}>
      {primaryText}
    </Button>
  );
};

export default ClosePopconfirm;
