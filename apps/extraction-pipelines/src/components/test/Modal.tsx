import { Button, Colors } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithChildren } from 'react';
import ReactModal, { OnAfterOpenCallbackOptions } from 'react-modal';
import styled from 'styled-components';
import { IntegrationProvider } from '../../hooks/details/IntegrationContext';
import { Integration } from '../../model/Integration';

const StyledReactModal = styled((props) => (
  <ReactModal {...props}>{props.children}</ReactModal>
))`
  .cogs-modal-content {
    height: 40rem;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }
  .cogs-modal-footer {
    justify-content: normal;
  }
  input,
  textarea {
    &.cogs-input {
      &.has-error {
        border-color: ${Colors.danger.hex()};
      }
    }
  }
`;
interface ModalFooter {
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
interface OwnProps extends ModalFooter, ModalContentProps {
  contentLabel?: string;
  visible: boolean;
  appElement: HTMLElement | {};
  afterOpenModal?: (obj?: OnAfterOpenCallbackOptions) => void;
  width?: number;
}
interface ModalContentProps extends ModalFooter {
  title?: string | React.ReactNode;
}
type Props = OwnProps;
const Modal: FunctionComponent<Props> = ({
  contentLabel,
  visible,
  afterOpenModal,
  width = 420,
  children,
  onCancel,
  appElement,
}: PropsWithChildren<Props>) => {
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
      {children}
    </StyledReactModal>
  );
};

interface ProviderWrapperProps {
  integration: Integration;
}

export const ProviderWrapper = ({
  integration,
  children,
}: PropsWithChildren<ProviderWrapperProps>) => {
  return (
    <IntegrationProvider initIntegration={integration}>
      {children}
    </IntegrationProvider>
  );
};
export const ModalContent = ({
  title,
  footer,
  onCancel,
  onOk,
  okText,
  cancelText,
  children,
}: PropsWithChildren<ModalContentProps>) => {
  return (
    <>
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
        <ModalFooter {...{ footer, onCancel, onOk, okText, cancelText }} />
      </div>
    </>
  );
};

export const ModalFooter = ({
  footer,
  onCancel,
  cancelText,
  onOk,
  okText,
}: ModalFooter) => {
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

export default Modal;
