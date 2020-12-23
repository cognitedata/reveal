import { render } from 'utils/test';
import React from 'react';
import { screen } from '@testing-library/react';
import AvatarWithTooltip from './AvatarWithTooltip';

describe('<AvatarWithTooltip/>', () => {
  test('Render avatar', async () => {
    const user = { name: 'Foo Bar', email: 'foo@bar.com' };
    render(<AvatarWithTooltip user={user} />);
    const avatar = screen.getByText('FB');
    expect(avatar).toBeInTheDocument();
  });

  test('Render avatar when only email is set', async () => {
    const user = { email: 'foo@bar.com' };
    render(<AvatarWithTooltip user={user} />);
    const avatar = screen.getByText('f');
    expect(avatar).toBeInTheDocument();
  });

  test('Render avatar when only name is set', async () => {
    const user = { name: 'Test Testish' };
    render(<AvatarWithTooltip user={user} />);
    const avatar = screen.getByText('TT');
    expect(avatar).toBeInTheDocument();
  });
});
