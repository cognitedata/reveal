import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalPanel } from '../components/Panel';

const meta = {
  title: 'Example/Image360HistoricalPanel',
  component: Image360HistoricalPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    revisionCount: 5,
    revisionDetailsExpanded: false,
    setRevisionDetailsExpanded: undefined
  },
};
