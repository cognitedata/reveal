import { Integration } from '../model/Integration';
import {
  ContactAccessor,
  ContactsTableCol,
} from '../components/table/details/ContactTableCols';
import { User } from '../model/User';
import { IntegrationUpdateSpec } from './IntegrationsAPI';
import { DetailFieldNames } from './integrationUtils';

export interface CreateUpdateContactsObjArgs extends Pick<Integration, 'id'> {
  data: ContactsTableCol;
}

export const mapContacts = (integration: Integration): ContactsTableCol[] => {
  const authors: ContactsTableCol[] = integration.authors.map(
    (author, index) => {
      return {
        label: DetailFieldNames.CONTACT,
        accessor: 'authors',
        name: author.name,
        email: author.email,
        indexInOriginal: index,
        original: integration.authors,
        isEditable: true,
        isDeletable: true,
        isNewContact: false,
        inputType: 'text',
      };
    }
  );
  return [
    {
      label: DetailFieldNames.OWNER,
      accessor: 'owner',
      name: integration.owner.name,
      email: integration.owner.email,
      indexInOriginal: 0,
      original: [integration.owner],
      isEditable: true,
      isDeletable: false,
      isNewContact: false,
      inputType: 'text',
    },
    ...authors,
  ];
};

export const filterAuthors = (
  contactCols: ContactsTableCol[],
  rowIndex: number
) => {
  const removed = contactCols.filter((_, index) => {
    return index !== rowIndex;
  });
  return getContactByAccessor(removed, 'authors');
};

const getContactByAccessor = (
  contactCols: ContactsTableCol[],
  accessor: ContactAccessor
) => {
  return contactCols
    .filter((c) => c.accessor === accessor)
    .map((author) => {
      return { name: author.name, email: author.email };
    });
};

export const createUpdateObj = (
  details: ContactsTableCol,
  contacts: ContactsTableCol[],
  integrationId: number
): IntegrationUpdateSpec[] => {
  const contactInfo = getContactByAccessor(contacts, details.accessor);
  if (details.accessor === 'owner') {
    return createUpdateOwnerObj({
      id: integrationId,
      owner: contactInfo[0],
    });
  }
  return createUpdateAuthorObj({
    id: integrationId,
    authors: contactInfo,
  });
};

interface CreateNewContact extends Pick<ContactsTableCol, 'indexInOriginal'> {
  authors: User[];
}

export const createNewAuthor = ({
  authors,
  indexInOriginal,
}: CreateNewContact): ContactsTableCol => {
  return {
    label: DetailFieldNames.CONTACT,
    accessor: 'authors',
    name: '',
    email: '',
    indexInOriginal,
    original: [...authors],
    isEditable: true,
    isDeletable: true,
    isNewContact: true,
    inputType: 'text',
  };
};

const createUpdateOwnerObj = ({
  id,
  owner,
}: {
  id: number;
  owner: User;
}): IntegrationUpdateSpec[] => {
  return [
    {
      id: `${id}`,
      update: { owner: { set: owner } },
    },
  ];
};

export const createUpdateAuthorObj = ({
  id,
  authors,
}: {
  id: number;
  authors: User[];
}): IntegrationUpdateSpec[] => {
  return [
    {
      id: `${id}`,
      update: { authors: { set: authors } },
    },
  ];
};
