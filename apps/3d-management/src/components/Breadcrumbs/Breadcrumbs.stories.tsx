/* eslint-disable react/no-multi-comp */

// Breadcrumbs.stories.ts|tsx
import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';

import type { Meta, StoryObj } from '@storybook/react';

import Breadcrumbs from './Breadcrumbs';

const meta = {
  component: Breadcrumbs,
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: 'Base',
  decorators: [
    (Story) => (
      <Router>
        <Story />
      </Router>
    ),
  ],
  args: {
    breadcrumbs: [
      { title: 'I AM A CRUMB', path: '/no-where' },
      { title: 'I AM ANOTHER', path: '/some-where' },
      { title: 'I HAVE NO PATH' },
    ],
  },
};
