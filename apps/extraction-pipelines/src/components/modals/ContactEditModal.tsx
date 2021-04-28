import React, { FunctionComponent, PropsWithChildren } from 'react';
import { ids } from 'cogs-variables';
import { ModalContent } from 'components/modals/ModalContent';
import DetailsFooter from 'components/modals/DetailsFooter';
import Modal from 'components/modals/Modal';
import { DivFlex } from 'styles/flex/StyledFlex';
import { CloseButton } from 'styles/StyledButton';
import styled from 'styled-components';
import { ContactsSection } from 'components/integration/ContactsSection';

const StyledModalContent = styled(ModalContent)`
  .cogs-modal-content {
    display: flex;
    flex-direction: column;
  }
`;
interface ContactEditModalProps {
  visible: boolean;
  onCancel: () => void;
}
export const ContactEditModal: FunctionComponent<ContactEditModalProps> = ({
  visible,
  onCancel,
}: PropsWithChildren<ContactEditModalProps>) => {
  return (
    <Modal
      visible={visible}
      width={1024}
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
    >
      <StyledModalContent
        title={
          <DivFlex justify="flex-end">
            <CloseButton onClick={onCancel} />
          </DivFlex>
        }
        footer={<DetailsFooter onPrimaryClick={onCancel} primaryText="Close" />}
      >
        <ContactsSection />
      </StyledModalContent>
    </Modal>
  );
};
