import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Modal } from '@cognite/cogs.js';

interface EditModalProps {
  visible: boolean;
  close: () => void;
  width?: number;
  title: string;
}

export const EditModal: FunctionComponent<EditModalProps> = ({
  visible,
  close,
  children,
  title,
}: PropsWithChildren<EditModalProps>) => {
  return (
    <Modal hideFooter onCancel={close} title={title} visible={visible}>
      {children}
    </Modal>
  );
};
