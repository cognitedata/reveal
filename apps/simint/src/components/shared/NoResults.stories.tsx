import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { Button } from '@cognite/cogs.js';

import { NoResults } from './NoResults';

const meta: Meta<typeof NoResults> = {
  component: NoResults,
};
export default meta;

type Story = StoryObj<typeof NoResults>;

export const Default: Story = {
  args: {
    bodyText: 'Please refine your filters or update the search parameters',
    headerText: 'No results',
  },
};

export const WithAction: Story = {
  args: {
    action: <Button type="primary">Create</Button>,
    bodyText: 'Create your first simulation routine to get started',
    headerText: 'No simulator runs found',
  },
};
