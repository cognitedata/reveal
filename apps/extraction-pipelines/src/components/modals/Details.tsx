import { Button, Title } from '@cognite/cogs.js';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { saveIntegration } from 'utils/integrationUtils';
import DetailsTable from 'components/table/details/DetailsTable';
import { useUpdateIntegration } from 'hooks/useUpdateIntegration';
import { useUpdateContacts } from 'hooks/useUpdateContacts';
import { Integration } from '../../model/Integration';
import { TableHeadings } from '../table/IntegrationTableCol';
import {
  DetailsCol,
  detailsCols,
  IntegrationFieldValue,
} from '../table/details/DetailsCols';
import { useAppEnv } from '../../hooks/useAppEnv';
import ContactsTable from '../table/details/ContactTable';
import {
  contactTableCols,
  ContactsTableCol,
} from '../table/details/ContactTableCols';
import { useContacts } from '../../hooks/details/useContacts';
import {
  createNewAuthor,
  createUpdateAuthorObj,
  filterAuthors,
  saveContacts,
} from '../../utils/contactsUtils';
import {
  Change,
  RemoveChange,
} from '../../hooks/details/useDetailsGlobalChanges';
import { useIntegrationDetails } from '../../hooks/details/useIntegrationDetails';
import { useSaveAuthors } from '../../hooks/details/useSaveAuthors';

const WrapperContacts = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 3rem;
`;
const StyledAddButton = styled((props) => (
  <Button {...props}>{props.children}</Button>
))`
  align-self: flex-end;
  margin: 1rem;
`;
interface OwnProps {
  integration: Integration;
  addChange: (change: Change) => void;
  removeChange: (change: RemoveChange) => void;
}

type Props = OwnProps;

const Details: FunctionComponent<Props> = ({
  integration,
  addChange: addGlobalChange,
  removeChange: removeGlobalChange,
}: Props) => {
  const { project } = useAppEnv();
  const {
    detailsState,
    undoUpdateDetails,
    updateDetails,
  } = useIntegrationDetails(integration);
  const [mutate] = useUpdateIntegration();
  const saveIntegrationDetails = saveIntegration(mutate, integration.id);

  const {
    addContact,
    removeContact: deleteContact,
    undoEditContact,
    editContact,
    contacts,
  } = useContacts(integration);
  const [mutateContacts] = useUpdateContacts();
  const [mutateAuthors] = useSaveAuthors();

  const saveContactInfo = saveContacts(mutateContacts, integration.id);

  const onClickAddContact = () => {
    const rowIndex = integration.authors.length + 1;
    addContact(
      createNewAuthor({
        indexInOriginal: rowIndex,
        authors: integration.authors,
      })
    );
  };

  const saveChangesToContacts = async (
    rowIndex: number,
    details: ContactsTableCol
  ) => {
    removeGlobalChange({ rowIndex, tableName: 'contacts' });
    if (project) {
      await saveContactInfo(project, details);
    }
  };

  const removeContact = async (rowIndex: number) => {
    removeGlobalChange({ rowIndex, tableName: 'contacts' });
    if (project) {
      const authors = filterAuthors(contacts, rowIndex);

      await mutateAuthors({
        project,
        items: createUpdateAuthorObj({
          id: integration.id,
          authors,
        }),
        id: integration.id,
      }).then(() => {
        deleteContact(rowIndex);
      });
    }
  };

  const updateContacts = (
    rowIndex: number,
    columnId: string,
    value: IntegrationFieldValue
  ) => {
    addGlobalChange({ rowIndex, tableName: 'contacts', value });
    editContact(rowIndex, columnId, value);
  };

  const undoChangeContacts = (rowIndex: number) => {
    removeGlobalChange({ rowIndex, tableName: 'contacts' });
    undoEditContact(rowIndex);
  };

  const saveChange = async (rowIndex: number, details: DetailsCol) => {
    removeGlobalChange({ rowIndex, tableName: 'details' });
    if (project) {
      await saveIntegrationDetails(project, details);
    }
  };

  const undoChange = (rowIndex: number) => {
    removeGlobalChange({ rowIndex, tableName: 'details' });
    undoUpdateDetails(rowIndex);
  };

  const updateData = (
    rowIndex: number,
    columnId: string,
    value: IntegrationFieldValue
  ) => {
    addGlobalChange({ rowIndex, tableName: 'details', value });
    updateDetails(rowIndex, columnId, value);
  };

  return (
    <>
      <DetailsTable
        data={detailsState}
        columns={detailsCols}
        updateData={updateData}
        undoChange={undoChange}
        saveChange={saveChange}
      />
      <WrapperContacts>
        <Title level={4}>{TableHeadings.CONTACTS}</Title>
        <ContactsTable
          data={contacts}
          updateData={updateContacts}
          undoChange={undoChangeContacts}
          saveChange={saveChangesToContacts}
          removeContact={removeContact}
          columns={contactTableCols}
        />
        <StyledAddButton
          variant="outline"
          onClick={onClickAddContact}
          data-testid="add-contact-btn"
        >
          Add
        </StyledAddButton>
      </WrapperContacts>
    </>
  );
};

export default Details;
