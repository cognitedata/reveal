import { Button } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import ReactModal, { OnAfterOpenCallbackOptions } from 'react-modal';

interface OwnProps {
  contentLabel?: string;
  visible: boolean;
  afterOpenModal?: (obj?: OnAfterOpenCallbackOptions) => void;
  width?: number;
  title?: string | React.ReactNode;
  okText?: string;
  onOk?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  appElement: HTMLElement | {};
}

type Props = OwnProps;
const IntegrationModal: FunctionComponent<Props> = ({
  contentLabel,
  visible,
  afterOpenModal,
  width = 420,
  children,
  title,
  okText = 'OK',
  onOk,
  cancelText = 'Cancel',
  onCancel,
  appElement,
}: PropsWithChildren<Props>) => {
  return (
    <ReactModal
      isOpen={!!visible}
      onAfterOpen={afterOpenModal}
      onRequestClose={onCancel}
      contentLabel={contentLabel}
      style={{ content: { width } }}
      appElement={appElement}
      portalClassName={`ReactModalPortal ${
        (appElement as HTMLElement)
          ? (appElement as HTMLElement).classList[0]
          : ''
      }`}
      overlayClassName="ReactModal__Overlay cogs-modal-overlay"
      className="ReactModal__Content cogs-modal"
    >
      <div key="modal-header" className="cogs-modal-header">
        {title}
      </div>
      <div key="modal-content" className="cogs-modal-content cogs-body-3">
        {children}
      </div>
      <div
        key="modal-footer"
        className="cogs-modal-footer cogs-modal-footer-buttons"
      >
        {onCancel && <Button onClick={onCancel}>{cancelText}</Button>}
        {onOk && (
          <Button type="primary" onClick={onOk}>
            {okText}
          </Button>
        )}
      </div>
    </ReactModal>
  );
};

export default IntegrationModal;
