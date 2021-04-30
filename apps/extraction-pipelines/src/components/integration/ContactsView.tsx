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

interface ContactsViewProps {}

export const ContactsView: FunctionComponent<ContactsViewProps> = () => {
  const { project } = useAppEnv();
  const { integration: selected } = useSelectedIntegration();
  const { data: integration } = useIntegrationById(selected?.id);
  const [, setShowModal] = useState(false);
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

  return (
    <>
      <DetailHeadingEditBtn onClick={openEdit}>
        {DetailFieldNames.OWNER}
      </DetailHeadingEditBtn>

      {owner[0] ? (
        <ContactCard {...owner[0]} />
      ) : (
        <AddFieldValueBtn onClick={openEdit}>
          {DetailFieldNames.OWNER.toLowerCase()}
        </AddFieldValueBtn>
      )}

      <DetailHeadingEditBtn onClick={openEdit}>
        {TableHeadings.CONTACTS}
      </DetailHeadingEditBtn>

      {other && other.length > 0 ? (
        other.map((contact: User) => {
          return <ContactCard key={contact.email} {...contact} />;
        })
      ) : (
        <AddFieldValueBtn onClick={openEdit}>
          {TableHeadings.CONTACTS.toLowerCase()}
        </AddFieldValueBtn>
      )}
    </>
  );
};
