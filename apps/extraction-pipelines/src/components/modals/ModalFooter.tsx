import { Button } from '@cognite/cogs.js';
import React from 'react';

export interface ModalFooterProps {
  okText?: string;
  onOk?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  footer?: React.ReactNode;
}
export const ModalFooter = ({
  footer,
  onCancel,
  cancelText,
  onOk,
  okText,
}: ModalFooterProps) => {
  if (footer) {
    return <>{footer}</>;
  }
  return (
    <>
      {onCancel && <Button onClick={onCancel}>{cancelText}</Button>}
      {onOk && (
        <Button type="primary" onClick={onOk}>
          {okText}
        </Button>
      )}
    </>
  );
};
