import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalDetailsPanel } from '../components';


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Example/Image360HistoricalDetailsPanel',
  component: Image360HistoricalDetailsPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalDetailsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Main: Story = {
  args: {
    revisionCount: 6,
    onDetailsClick: () => {alert('Test panel')}
  },
};
