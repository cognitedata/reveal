import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { Modal, Props } from './Modal';

export type WarningModalProps = Props;

export const WarningModal: React.FC<Props> = ({
  children,
  onOk,
  onCancel,
  okText,
  cancelText,
  ...rest
}) => {
  const footer = (
    <div className="cogs-modal-footer-buttons">
      <Button
        data-testid="warning-modal-cancel"
        type="secondary"
        onClick={onCancel}
      >
        {cancelText || 'Cancel'}
      </Button>
      <Button data-testid="warning-modal-unassign" type="danger" onClick={onOk}>
        {okText || 'Proceed'}
      </Button>
    </div>
  );

  return (
    <Modal {...rest} onCancel={onCancel} footer={footer}>
      {children}
    </Modal>
  );
};
