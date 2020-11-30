import { Button } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import ReactModal, { OnAfterOpenCallbackOptions } from 'react-modal';
import styled from 'styled-components';

const StyledReactModal = styled((props) => (
  <ReactModal {...props}>{props.children}</ReactModal>
))`
  .cogs-modal-content {
    height: 40rem;
    overflow: auto;
  }
  .cogs-modal-footer {
    justify-content: normal;
  }
`;
interface ShowFooter {
  okText?: string;
  onOk?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  footer?: React.ReactNode;
}
interface OwnProps extends ShowFooter {
  contentLabel?: string;
  visible: boolean;
  appElement: HTMLElement | {};
  afterOpenModal?: (obj?: OnAfterOpenCallbackOptions) => void;
  width?: number;
  title?: string | React.ReactNode;
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
  footer,
}: PropsWithChildren<Props>) => {
  const showFooter = ({
    footer: displayFooter,
    onCancel: onCancelLocal,
    cancelText: cancel,
    onOk: onOkLocal,
    okText: ok,
  }: ShowFooter) => {
    if (displayFooter) {
      return <>{displayFooter}</>;
    }
    return (
      <>
        {onCancelLocal && <Button onClick={onCancelLocal}>{cancel}</Button>}
        {onOk && (
          <Button type="primary" onClick={onOkLocal}>
            {ok}
          </Button>
        )}
      </>
    );
  };

  return (
    <StyledReactModal
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
        {showFooter({ footer, onCancel, onOk, cancelText, okText })}
      </div>
    </StyledReactModal>
  );
};

export default IntegrationModal;
