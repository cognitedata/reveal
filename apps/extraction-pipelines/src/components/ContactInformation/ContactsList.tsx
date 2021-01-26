import React from 'react';
import { ContactCard } from './ContactCard';
import { User } from '../../model/User';

interface ContactsListProps {
  title: string;
  contacts: User[];
}

const ContactsList = ({ title, contacts }: ContactsListProps) => {
  const renderList = (titleText: string, users?: User[]) => {
    if (!users || users.length === 0) {
      return <i>{`No ${titleText.toLowerCase()} set`}</i>;
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
