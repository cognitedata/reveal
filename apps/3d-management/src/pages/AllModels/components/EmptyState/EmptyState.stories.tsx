import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@cognite/cogs.js';

import EmptyState, { EmptyStateOptions } from './EmptyState';

const meta = {
  component: EmptyState,
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default',
  render: () => <EmptyState />,
};

export const ThreeDModel: Story = {
  name: '3D Model',
  render: () => <EmptyState type={EmptyStateOptions.ThreeDModel} />,
};

export const Favourites: Story = {
  name: 'Favorites',
  render: () => <EmptyState type={EmptyStateOptions.Favorites} />,
};

export const CustomText: Story = {
  name: 'Custom text',
  render: () => <EmptyState text="Custom text" />,
};

export const Extra: Story = {
  name: 'Extra',
  render: () => (
    <EmptyState
      text="Custom text"
      extra={<Button type="primary">Click me</Button>}
    />
  ),
};

export const StatefulStory: Story = {
  name: 'Stateful story',
  render: () => {
    class StatefulEmptyState extends React.Component {
      state = {};

      render() {
        return (
          <div>
            <EmptyState />
          </div>
        );
      }
    }
    return <StatefulEmptyState />;
  },
};
