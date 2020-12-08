import React from 'react';
import Modal from 'react-modal';
import noop from 'lodash/noop';
import { Title, Button, Icon } from '@cognite/cogs.js';
import {
  ModalCloseButton,
  ModalHeaderUnderline,
  ModalContent,
  FooterContainer,
} from './elements';

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '32px 32px 48px 32px',
  },
};

interface Props {
  width?: number;
  children: React.ReactNode;
  closeIcon?: React.ReactNode;
  headerText: string;
  footer?: React.ReactNode;
  hasFooter?: boolean;
  okText?: string;
  onCancel?: () => void;
  onOk?: () => any;
  cancelText?: string;
  visible?: boolean;
}

const CloseIconDefault = <Icon type="LargeClose" />;

const CustomModal: React.FC<Props> = ({
  width = 420,
  children,
  closeIcon = CloseIconDefault,
  headerText,
  footer,
  hasFooter = true,
  okText = 'OK',
  onCancel = noop,
  onOk = noop,
  cancelText = 'Cancel',
  visible,
}: Props) => {
  const FooterDefault = (
    <>
      <Button onClick={onCancel}>{cancelText}</Button>
      <Button type="primary" onClick={onOk}>
        {okText}
      </Button>
    </>
  );

  return (
    <div>
      <Modal
        isOpen={!!visible}
        closeTimeoutMS={500}
        style={{
          content: {
            ...customStyles.content,
            width,
          },
        }}
        onRequestClose={onCancel}
        overlayClassName="cogs-modal-overlay"
      >
        <Title level={3}>{headerText}</Title>
        {closeIcon && (
          <ModalCloseButton>
            <Button unstyled variant="ghost" onClick={onCancel}>
              {closeIcon}
            </Button>
          </ModalCloseButton>
        )}
        <ModalHeaderUnderline />
        <ModalContent>{children}</ModalContent>
        {hasFooter && (
          <>
            {(footer && footer) || (
              <FooterContainer>{FooterDefault}</FooterContainer>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default CustomModal;
