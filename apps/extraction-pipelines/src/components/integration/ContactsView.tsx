import React, { FunctionComponent, useState } from 'react';
import { ContactCard } from 'components/ContactInformation/ContactCard';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { useAppEnv } from 'hooks/useAppEnv';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { isOwner, partition } from 'utils/integrationUtils';
import { User } from 'model/User';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { EditModal } from 'components/modals/EditModal';
import { ContactsSection } from 'components/integration/ContactsSection';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

const Wrapper = styled.div`
  &:hover {
    background-color: ${Colors['midblue-8'].hex()};
    cursor: pointer;
  }
`;
interface ContactsViewProps {
  canEdit: boolean;
}

export const ContactsView: FunctionComponent<ContactsViewProps> = ({
  canEdit,
}) => {
  const { project } = useAppEnv();
  const { integration: selected } = useSelectedIntegration();
  const { data: integration } = useIntegrationById(selected?.id);
  const [showModal, setShowModal] = useState(false);
  if (!integration || !project) {
    return <></>;
  }
  const { pass: owner, fail: other } = partition<User>(
    integration.contacts ?? [],
    isOwner
  );

  const contacts = integration.contacts;

  const openEdit = () => {
    setShowModal(true);
  };

  const hideModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Wrapper onClick={openEdit}>
        {contacts && contacts.length > 0 ? (
          contacts.map((contact: User) => {
            return <ContactCard key={contact.email} {...contact} />;
          })
        ) : (
          <AddFieldValueBtn canEdit={canEdit} onClick={openEdit}>
            {TableHeadings.CONTACTS.toLowerCase()}
          </AddFieldValueBtn>
        )}
      </Wrapper>
      <EditModal visible={showModal} onCancel={hideModal} width={1024}>
        <ContactsSection />
      </EditModal>
    </>
  );
};
