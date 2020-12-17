import { Button } from '@cognite/cogs.js';
import React from 'react';

export interface ModalFooterProps {
  // eslint-disable-next-line
  okText?: string;
  // eslint-disable-next-line
  onOk?: () => void;
  // eslint-disable-next-line
  cancelText?: string;
  // eslint-disable-next-line
  onCancel?: () => void;
  // eslint-disable-next-line
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
