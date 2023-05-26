import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalDetailsView } from '../components';

const meta = {
  title: 'Example/Image360HistoricalDetailsView',
  component: Image360HistoricalDetailsView,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalDetailsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    viewer: undefined,
    stationId: 'stationId',
    stationName: 'stationName',
    collectionId: 'collectionId',
    image360Entity: undefined,
  },
};
