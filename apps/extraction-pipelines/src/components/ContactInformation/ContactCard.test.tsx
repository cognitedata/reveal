import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import ContactCard from './ContactCard';
import { getMockResponse } from '../../utils/mockResponse';

describe('ContactCard', () => {
  test('Render ContactCard with name and email filds', () => {
    const { name, email } = getMockResponse()[0].owner;
    render(<ContactCard name={name} email={email} />);
    const nameString = screen.getByText(name);
    expect(nameString).toBeInTheDocument();
    const emailString = screen.getByText(email);
    expect(emailString).toBeInTheDocument();
  });
});
