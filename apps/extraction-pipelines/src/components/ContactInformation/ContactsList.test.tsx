import React from 'react';
import { screen } from '@testing-library/react';
import ContactsList from './ContactsList';
import { render } from '../../utils/test';
import { getMockResponse } from '../../utils/mockResponse';

describe('<ContactsList />', () => {
  const title = 'Contacts';
  test('Render contact list', () => {
    const { contacts } = getMockResponse()[0];
    render(<ContactsList title={title} contacts={contacts} />);
    contacts.forEach((contact) => {
      expect(screen.getByText(contact.name)).toBeInTheDocument();
      expect(screen.getByText(contact.email)).toBeInTheDocument();
    });
  });
});
