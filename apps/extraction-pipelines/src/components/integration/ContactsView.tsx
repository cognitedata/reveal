import React, { FunctionComponent, useState } from 'react';
import { DetailFieldNames } from 'model/Integration';
import { ContactCard } from 'components/ContactInformation/ContactCard';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { useAppEnv } from 'hooks/useAppEnv';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { isOwner, partition } from 'utils/integrationUtils';
import { User } from 'model/User';
import { DetailHeadingEditBtn } from 'components/buttons/DetailHeadingEditBtn';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { EditModal } from 'components/modals/EditModal';
import { ContactsSection } from 'components/integration/ContactsSection';
import styled from 'styled-components';
import { sideBarSectionSpacing } from 'styles/StyledVariables';

const Wrapper = styled.div`
  margin-bottom: ${sideBarSectionSpacing};
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

  const openEdit = () => {
    setShowModal(true);
  };

  const hideModal = () => {
    setShowModal(false);
  };

  return (
    <Wrapper>
      <DetailHeadingEditBtn canEdit={canEdit} onClick={openEdit}>
        {DetailFieldNames.OWNER}
      </DetailHeadingEditBtn>

      {owner[0] ? (
        <ContactCard {...owner[0]} />
      ) : (
        <AddFieldValueBtn canEdit={canEdit} onClick={openEdit}>
          {DetailFieldNames.OWNER.toLowerCase()}
        </AddFieldValueBtn>
      )}

      <DetailHeadingEditBtn canEdit={canEdit} onClick={openEdit}>
        {TableHeadings.CONTACTS}
      </DetailHeadingEditBtn>

      {other && other.length > 0 ? (
        other.map((contact: User) => {
          return <ContactCard key={contact.email} {...contact} />;
        })
      ) : (
        <AddFieldValueBtn canEdit={canEdit} onClick={openEdit}>
          {TableHeadings.CONTACTS.toLowerCase()}
        </AddFieldValueBtn>
      )}
      <EditModal visible={showModal} onCancel={hideModal} width={1024}>
        <ContactsSection />
      </EditModal>
    </Wrapper>
  );
};
