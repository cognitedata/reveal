import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalDetailsPanel } from '../components';

const meta = {
  title: 'Example/Image360HistoricalDetailsPanel',
  component: Image360HistoricalDetailsPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalDetailsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    revisionCount: 5,
    revisionDetailsExpanded: undefined,
    setRevisionDetailsExpanded: undefined
  },
};
