import React from 'react';
import { render, screen } from '@testing-library/react';
import UserDetails from './UserDetails';
import { User } from '../../../model/User';

describe('<UserDetails />', () => {
  const cases = [
    {
      desc: 'Render user name when defined',
      value: { name: 'Test Person', email: 'test@test.com' },
      expected: /Test Person/i,
    },
    {
      desc: 'Render email when name is undefined',
      value: { email: 'test@test.com' } as User,
      expected: /test@test.com/i,
    },
  ];
  cases.forEach(({ desc, value, expected }) => {
    test(`${desc}`, () => {
      render(<UserDetails user={value} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
