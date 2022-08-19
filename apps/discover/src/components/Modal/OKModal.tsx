import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { Modal, Props } from './Modal';

export type OkModalProps = Props;

export const OKModal: React.FC<Props> = ({
  children,
  onOk,
  okText,

  ...rest
}) => {
  const footer = (
    <div className="cogs-modal-footer-buttons">
      <Button type="primary" onClick={onOk}>
        {okText || 'OK'}
      </Button>
    </div>
  );

  return (
    <Modal {...rest} footer={footer}>
      {children}
    </Modal>
  );
};
