import * as React from 'react';

import { Button, Modal } from '@cognite/cogs.js';

import { CloseButton } from 'components/Buttons';

import {
  ConfirmBody,
  ConfirmFooter,
  ConfirmHeader,
  ConfirmHeaderLabel,
} from './elements';

const modalStyle = {
  borderRadius: '8px',
  top: 'calc(50% - 130px)',
};

interface Props {
  title: string;
  disabled?: boolean;
  content: string | JSX.Element | JSX.Element[];
}

/**
 * Prompts a popup modal on which the user have to accept/decline to perform given action.
 *
 * @example
 * <ModalConfirm title="Do you want to do this?" content="Are you sure?">
 *  <Button onClick={() => performAction()} />
 * </ModalConfirm>
 */
export const ModalConfirm: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  title,
  content,
  disabled,
}) => {
  const ref = React.createRef<HTMLElement>();
  const [open, setOpen] = React.useState(false);

  const toggleModal = () => setOpen((prevState) => !prevState);

  const onOk = () => {
    if (ref.current) {
      ref.current.click();
    }
  };
  const onCancel = () => setOpen(false);

  const handleCaptureClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (disabled) {
      return;
    }

    if (!open) {
      event.stopPropagation();
    }

    toggleModal();
  };

  const renderChildren = () => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children, { ref });
    }

    return null;
  };

  return (
    <>
      <div onClickCapture={handleCaptureClick}>{renderChildren()}</div>

      <Modal
        style={modalStyle}
        footer={
          <ConfirmFooter>
            <Button type="ghost-danger" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" onClick={onOk}>
              Confirm
            </Button>
          </ConfirmFooter>
        }
        closeIcon={null}
        visible={open}
        closable={false}
        onOk={onOk}
        width={640}
        appElement={document.getElementById('root') || undefined}
      >
        <ConfirmHeader>
          <ConfirmHeaderLabel>{title}</ConfirmHeaderLabel>
          <CloseButton
            onClick={onCancel}
            aria-label="Close and clear the results"
          />
        </ConfirmHeader>

        <ConfirmBody>{content}</ConfirmBody>
      </Modal>
    </>
  );
};
