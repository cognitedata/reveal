import { MutateFunction } from 'react-query';
import { Integration } from '../model/Integration';
import { ContactsTableCol } from '../components/table/details/ContactTableCols';
import { User } from '../model/User';
import { IntegrationUpdateSpec } from './IntegrationsAPI';
import { CreateUpdateObjArgs, DetailFieldNames } from './integrationUtils';
import { SDKError } from '../model/SDKErrors';
import { UseUpdateContactsVariables } from '../hooks/useUpdateContacts';

export interface CreateUpdateContactsObjArgs extends Pick<Integration, 'id'> {
  data: ContactsTableCol;
}

export const saveContacts = (
  mutate: MutateFunction<Integration, SDKError, UseUpdateContactsVariables>,
  id: Integration['id']
) => {
  return async function save(project: string, dataSource: ContactsTableCol) {
    await mutate({ data: dataSource, id, project });
  };
};

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
  contacts: ContactsTableCol[],
  rowIndex: number
) => {
  return contacts
    .filter((c, index) => {
      return index !== rowIndex;
    })
    .filter((c) => {
      return c.accessor !== 'owner';
    })
    .map((contact) => {
      return { name: contact.name, email: contact.email };
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

export const createUpdateContacts = ({
  id,
  data,
}: CreateUpdateObjArgs<ContactsTableCol>): IntegrationUpdateSpec[] => {
  if (data.accessor === 'authors') {
    const updatedContacts: User[] = updateAuthorsLogic(data);

    const update = [
      {
        id: `${id}`,
        update: { [data.accessor]: { set: updatedContacts } },
      },
    ];
    return update;
  }
  return [
    {
      id: `${id}`,
      update: {
        [data.accessor]: { set: { name: data.name, email: data.email } },
      },
    },
  ];
};

export const updateAuthorsLogic = (data: ContactsTableCol): User[] => {
  if (data.isNewContact) {
    return [...data.original, { name: data.name, email: data.email }];
  }
  return data.original.map((user, index) => {
    if (index === data.indexInOriginal) {
      return { name: data.name, email: data.email };
    }
    return user;
  });
};
