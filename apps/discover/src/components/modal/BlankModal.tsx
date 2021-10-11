import React from 'react';

import { Modal, Props } from './Modal';

export const BlankModal: React.FC<Props> = ({
  children,

  ...rest
}) => {
  return (
    <Modal {...rest} footer={null}>
      {children}
    </Modal>
  );
};
