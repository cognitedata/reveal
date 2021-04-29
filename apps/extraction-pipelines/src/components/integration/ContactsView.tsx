import React, { FunctionComponent, useState } from 'react';
import { DetailFieldNames } from 'model/Integration';
import { ContactCard } from 'components/ContactInformation/ContactCard';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { useAppEnv } from 'hooks/useAppEnv';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import styled from 'styled-components';
import { Button, Colors, Title } from '@cognite/cogs.js';
import { isOwner, partition } from 'utils/integrationUtils';
import { User } from 'model/User';
import { BluePlus, BlueText, StyledEdit } from 'styles/StyledButton';

const ContactStyledEdit = styled(StyledEdit)`
  font-weight: bold;
`;
const StyledDetail = styled(Title)`
  border-bottom: 1px solid ${Colors['greyscale-grey2'].hex()};
  padding-bottom: 0.3rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;
const StyledButton = styled(Button)`
  width: ${(props: { width?: string }) => props.width || 'auto'};
`;
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
      <StyledDetail level={4}>
        <ContactStyledEdit onClick={openEdit} $full>
          {DetailFieldNames.OWNER}
        </ContactStyledEdit>
      </StyledDetail>

      {owner[0] ? (
        <ContactCard {...owner[0]} />
      ) : (
        <StyledButton type="ghost" onClick={openEdit} width="fit-content">
          <BluePlus />
          <BlueText>add {DetailFieldNames.OWNER.toLowerCase()}</BlueText>
        </StyledButton>
      )}

      <StyledDetail level={4}>
        <ContactStyledEdit onClick={openEdit} $full>
          {TableHeadings.CONTACTS}
        </ContactStyledEdit>
      </StyledDetail>

      {other && other.length > 0 ? (
        other.map((contact: User) => {
          return <ContactCard key={contact.email} {...contact} />;
        })
      ) : (
        <StyledButton type="ghost" onClick={openEdit} width="fit-content">
          <BluePlus />
          <BlueText>add {TableHeadings.CONTACTS.toLowerCase()}</BlueText>
        </StyledButton>
      )}
    </>
  );
};
