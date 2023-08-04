import * as React from 'react';

import { Meta, StoryFn } from '@storybook/react';

import { UserMenu } from './UserMenu';

export default {
  component: UserMenu,
} as Meta<typeof UserMenu>;

export const Default: StoryFn<typeof UserMenu> = (args) => (
  <UserMenu {...args} />
);

Default.args = {
  userInfo: { name: 'John', email: 'john@example.com' },
  onManageAccountClick: () => console.log('onManageAccountClick called'),
  onLogoutClick: () => console.log('onLogoutClick called'),
};
