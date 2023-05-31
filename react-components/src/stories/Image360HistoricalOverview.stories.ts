import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalOverview } from '../components';

const meta = {
  title: 'Example/Image360HistoricalOverview',
  component: Image360HistoricalOverview,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    revisionCount: 5,
    revisionDetailsExpanded: undefined,
    setRevisionDetailsExpanded: undefined
  },
};
