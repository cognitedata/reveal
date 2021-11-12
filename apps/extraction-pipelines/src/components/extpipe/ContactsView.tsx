import React, { FunctionComponent, useState } from 'react';
import { ContactCard } from 'components/ContactInformation/ContactCard';
import { TableHeadings } from 'components/table/ExtpipeTableCol';
import { useAppEnv } from 'hooks/useAppEnv';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import { User } from 'model/User';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { EditModal } from 'components/modals/EditModal';
import { ContactsDialog, isOwnerRole } from 'components/extpipe/ContactsDialog';
import styled from 'styled-components';
import { EditableAreaButton } from 'components/extpipe/EditableAreaButton';

const Wrapper = styled.div``;

export const MarginedChildren = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface ContactsViewProps {
  canEdit: boolean;
}

export const ContactsView: FunctionComponent<ContactsViewProps> = ({
  canEdit,
}) => {
  const { project } = useAppEnv();
  const { extpipe: selected } = useSelectedExtpipe();
  const { data: extpipe } = useExtpipeById(selected?.id);
  const [showModal, setShowModal] = useState(false);
  if (!extpipe || !project) {
    return <></>;
  }
  const { contacts } = extpipe;
  const contactsSorted = [...(contacts ?? [])].sort(
    (a, b) =>
      (isOwnerRole(a.role ?? '') ? -1000 : 0) -
      (isOwnerRole(b.role ?? '') ? -1000 : 0)
  );

  const openEdit = () => {
    setShowModal(canEdit);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Wrapper>
        {contacts && contacts.length > 0 ? (
          <EditableAreaButton disabled={!canEdit} onClick={openEdit} $full>
            <MarginedChildren>
              {contactsSorted.map((contact: User) => {
                return <ContactCard key={contact.email} {...contact} />;
              })}
            </MarginedChildren>
          </EditableAreaButton>
        ) : (
          <AddFieldValueBtn canEdit={canEdit} onClick={openEdit}>
            {TableHeadings.CONTACTS.toLowerCase()}
          </AddFieldValueBtn>
        )}
      </Wrapper>
      <EditModal
        title={TableHeadings.CONTACTS}
        visible={showModal}
        close={closeModal}
        width={1024}
      >
        <ContactsDialog close={closeModal} />
      </EditModal>
    </>
  );
};
