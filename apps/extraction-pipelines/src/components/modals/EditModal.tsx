import React, { FunctionComponent, PropsWithChildren } from 'react';
import { ModalContent } from 'components/modals/ModalContent';
import { ids } from 'cogs-variables';
import { DivFlex } from 'styles/flex/StyledFlex';
import { CloseButton } from 'styles/StyledButton';
import Modal from 'components/modals/Modal';
import DetailsFooter from 'components/modals/DetailsFooter';

interface EditModalProps {
  visible: boolean;
  onCancel: () => void;
  width?: number;
}

export const EditModal: FunctionComponent<EditModalProps> = ({
  visible,
  onCancel,
  width = 872,
  children,
}: PropsWithChildren<EditModalProps>) => {
  return (
    <Modal
      visible={visible}
      width={width}
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
    >
      <ModalContent
        title={
          <DivFlex justify="flex-end">
            <CloseButton onClick={onCancel} />
          </DivFlex>
        }
        footer={<DetailsFooter onPrimaryClick={onCancel} primaryText="Close" />}
      >
        {children}
      </ModalContent>
    </Modal>
  );
};
