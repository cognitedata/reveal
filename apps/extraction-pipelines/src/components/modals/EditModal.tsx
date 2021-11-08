import React, { FunctionComponent, PropsWithChildren } from 'react';
import { ids } from 'cogs-variables';
import Modal from 'components/modals/Modal';
import { Button } from '@cognite/cogs.js';
import { StyledTitle2 } from 'styles/StyledHeadings';

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
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
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
