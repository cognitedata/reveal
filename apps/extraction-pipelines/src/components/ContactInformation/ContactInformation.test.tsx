import { screen } from '@testing-library/react';
import React from 'react';
import { render } from '../../utils/test';
import ContactInformation from './ContactInformation';
import { NO_CONTACTS_MSG } from '../../utils/constants';

describe('ContactInformation', () => {
  const title = 'Contacts';
  test('Render when contacts is empty', () => {
    const contacts = [];
    render(<ContactInformation contacts={contacts} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(NO_CONTACTS_MSG)).toBeInTheDocument();
  });

  test('Render when contacts is undefined', () => {
    const contacts = undefined;
    render(<ContactInformation contacts={contacts} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(NO_CONTACTS_MSG)).toBeInTheDocument();
  });
});
