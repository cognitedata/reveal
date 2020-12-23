import React from 'react';
import { screen } from '@testing-library/react';
import EmailLink from './EmailLink';
import { render } from '../../utils/test';

describe('EmailLink', () => {
  test('Should render email link', () => {
    const email = 'test@test.no';
    render(<EmailLink email={email} />);
    const emailLink = screen.getByText(email);
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.getAttribute('href')).toEqual(`mailto:${email}`);
  });

  test('Should render when email is undefined', () => {
    const email = undefined;
    render(<EmailLink email={email} />);
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });
});
