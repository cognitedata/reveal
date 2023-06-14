import React, { PropsWithChildren } from 'react';
import { ModalFooter, ModalFooterProps } from './ModalFooter';

export interface ModalContentProps extends ModalFooterProps {
  title?: string | React.ReactNode;
}
export const ModalContent = ({
  footer,
  onCancel,
  onOk,
  okText,
  cancelText,
  children,
}: PropsWithChildren<ModalContentProps>) => {
  return (
    <>
      <div key="modal-content" className="cogs-modal-content cogs-body-3">
        {children}
      </div>
      <div key="modal-footer" className="cogs-modal-footer-buttons">
        <ModalFooter {...{ footer, onCancel, onOk, okText, cancelText }} />
      </div>
    </>
  );
};
