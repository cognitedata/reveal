import React from 'react';
import { ContactsTableCol } from '../../components/table/details/ContactTableCols';
import { IntegrationFieldValue } from '../../components/table/details/DetailsCols';
import { Integration } from '../../model/Integration';
import { mapContacts } from '../../utils/contactsUtils';

export const useContacts = (integration: Integration) => {
  const contactsSource = mapContacts(integration);
  const [contacts, setContacts] = React.useState<ContactsTableCol[]>(
    contactsSource
  );
  const [originalContacts] = React.useState(contactsSource);

  const addContact = (contact: ContactsTableCol) => {
    setContacts((old) => {
      return [...old, contact];
    });
  };

  const removeContact = (indexToRemove: number) => {
    setContacts((old) => {
      return old.filter((_, index) => index !== indexToRemove);
    });
  };

  const editContact = (
    rowIndex: number,
    columnId: string,
    value: IntegrationFieldValue
  ) => {
    setContacts((old) => {
      return old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      });
    });
  };

  const undoEditContact = (rowIndex: number) => {
    setContacts((old) => {
      return old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            name: originalContacts[rowIndex]
              ? originalContacts[rowIndex].name
              : '',
            email: originalContacts[rowIndex]
              ? originalContacts[rowIndex].email
              : '',
          };
        }
        return row;
      });
    });
  };
  return {
    contacts,
    addContact,
    removeContact,
    editContact,
    undoEditContact,
  };
};
