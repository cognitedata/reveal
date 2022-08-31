import React, { FunctionComponent, PropsWithChildren } from 'react';
import { styleScope } from 'utils/utils';
import Modal from 'components/modals/Modal';
import { Button } from '@cognite/cogs.js';
import { StyledTitle2 } from 'components/styled';

interface EditModalProps {
  visible: boolean;
  close: () => void;
  width?: number;
  title: string;
}

export const EditModal: FunctionComponent<EditModalProps> = ({
  visible,
  close,
  width = 872,
  children,
  title,
}: PropsWithChildren<EditModalProps>) => {
  return (
    <Modal
      visible={visible}
      width={width}
      appElement={document.getElementsByClassName(styleScope).item(0)!}
    >
      <div css="display: flex; justify-content: space-between;">
        <StyledTitle2>{title}</StyledTitle2>
        <Button
          icon="Close"
          aria-label="Close dialog"
          onClick={close}
          type="ghost"
        />
      </div>
      {children}
    </Modal>
  );
};
