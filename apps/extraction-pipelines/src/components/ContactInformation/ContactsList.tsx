import React from 'react';
import { ContactCard } from './ContactCard';
import { User } from '../../model/User';
import { NO_CONTACTS_MSG } from '../../utils/constants';

interface ContactsListProps {
  title: string;
  contacts: User[];
}

const ContactsList = ({ title, contacts }: ContactsListProps) => {
  const renderList = (titleText: string, users?: User[]) => {
    if (!users || users.length === 0) {
      return <i>{NO_CONTACTS_MSG}</i>;
    }
    return (
      <>
        {users.map((user) => (
          <ContactCard
            key={`contact-list-${user.email}-${user.name}`}
            {...user}
          />
        ))}
      </>
    );
  };
  return <>{renderList(title, contacts)}</>;
};

export default ContactsList;
