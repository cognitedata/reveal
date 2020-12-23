import React from 'react';
import { screen } from '@testing-library/react';
import ContactsList from './ContactsList';
import { render } from '../../utils/test';
import { getMockResponse } from '../../utils/mockResponse';

describe('<ContactsList />', () => {
  const title = 'Contacts';
  test('Render contact list', () => {
    const contacts = getMockResponse()[0].authors;
    render(<ContactsList title={title} contacts={contacts} />);
    contacts.forEach((contact) => {
      expect(screen.getByText(contact.name)).toBeInTheDocument();
      expect(screen.getByText(contact.email)).toBeInTheDocument();
    });
  });

  test('Render when contacts is empty', () => {
    const contacts = [];
    render(<ContactsList title={title} contacts={contacts} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(
      screen.getByText(`No ${title.toLowerCase()} set`)
    ).toBeInTheDocument();
  });

  test('Render when contacts is undefined', () => {
    const contacts = undefined;
    render(<ContactsList title={title} contacts={contacts} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(
      screen.getByText(`No ${title.toLowerCase()} set`)
    ).toBeInTheDocument();
  });
});
