import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { getMockResponse } from 'utils/mockResponse';
import { ContactCard } from './ContactCard';

describe('ContactCard', () => {
  test('Render ContactCard with fields', () => {
    const {
      name,
      email,
      sendNotification,
      role,
    } = getMockResponse()[0].contacts[1];
    render(
      <ContactCard
        name={name}
        email={email}
        role={role}
        sendNotification={sendNotification}
      />
    );
    const nameString = screen.getByText(name);
    expect(nameString).toBeInTheDocument();
    const emailString = screen.getByText(email);
    expect(emailString).toBeInTheDocument();
    const roleString = screen.getByText(role);
    expect(roleString).toBeInTheDocument();
    const notification = screen.getByText(new RegExp(/notification/, 'i'));
    expect(notification).toBeInTheDocument();
  });

  test('Render notification when sendNotification not set', () => {
    const {
      name,
      email,
      sendNotification,
      role,
    } = getMockResponse()[0].contacts[0];
    render(
      <ContactCard
        name={name}
        email={email}
        role={role}
        sendNotification={sendNotification}
      />
    );
    const notification = screen.getByText(new RegExp(/notification/, 'i'));
    expect(notification).toBeInTheDocument();
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
