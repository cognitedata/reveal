import type { Meta, StoryObj } from '@storybook/react';
import { It, Mock } from 'moq.ts';
import { Cognite3DViewer, Image360, Image360Revision } from '@cognite/reveal';
import { RevealContainer } from '..';

const meta = {
  title: 'Example/RevealContainer',
  component: RevealContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof RevealContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
  }
};
