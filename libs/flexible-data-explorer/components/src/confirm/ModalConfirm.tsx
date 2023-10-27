import * as React from 'react';

import styled from 'styled-components';

import { Modal } from '@cognite/cogs.js';

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
      return React.cloneElement(children, { ref } as any);
    }

    return null;
  };

  return (
    <>
      <Container onClickCapture={handleCaptureClick}>
        {renderChildren()}
      </Container>

      <Modal
        onCancel={onCancel}
        visible={open}
        closable
        onOk={onOk}
        okText="Continue"
        title={title}
      >
        <div>{content}</div>
      </Modal>
    </>
  );
};

const Container = styled.div`
  display: inline-block;
`;
