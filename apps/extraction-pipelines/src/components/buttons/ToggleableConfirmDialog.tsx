import React from 'react';
import { Button } from '@cognite/cogs.js';
import {
  ConfirmDialogButton,
  ConfirmDialogButtonProps,
} from './ConfirmDialogButton';

interface ToggleableConfirmDialogProps extends ConfirmDialogButtonProps {
  showConfirmBox: boolean;
}

export const ToggleableConfirmDialog = ({
  showConfirmBox,
  type,
  primaryText,
  onClick,
  testId,
  ...rest
}: ToggleableConfirmDialogProps) => {
  if (showConfirmBox) {
    return (
      <ConfirmDialogButton
        onClick={onClick}
        testId={testId}
        primaryText={primaryText}
        type={type}
        {...rest}
      />
    );
  }
  return (
    <Button type={type} onClick={onClick} data-testid={testId}>
      {primaryText}
    </Button>
  );
};
