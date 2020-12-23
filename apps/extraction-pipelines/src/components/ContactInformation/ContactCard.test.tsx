import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import ContactCard from './ContactCard';
import { getMockResponse } from '../../utils/mockResponse';

describe('ContactCard', () => {
  test('Render ContactCard with name and email fields', () => {
    const { name, email } = getMockResponse()[0].owner;
    render(<ContactCard name={name} email={email} />);
    const nameString = screen.getByText(name);
    expect(nameString).toBeInTheDocument();
    const emailString = screen.getByText(email);
    expect(emailString).toBeInTheDocument();
  });

  test('Render ContactCard when only email field', () => {
    const contact = { email: 'foo@bar.no' };
    render(<ContactCard name={undefined} email={contact.email} />);
    const emailString = screen.getByText(contact.email);
    expect(emailString).toBeInTheDocument();
  });

  test('Render ContactCard when only name field', () => {
    const contact = { name: 'foo bar' };
    render(<ContactCard name={contact.name} email={undefined} />);
    const name = screen.getByText(contact.name);
    expect(name).toBeInTheDocument();
  });
});
