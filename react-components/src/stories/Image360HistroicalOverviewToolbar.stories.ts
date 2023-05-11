import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalOverviewToolbar } from '../components';


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Example/Image360HistoricalOverviewToolbar',
  component: Image360HistoricalOverviewToolbar,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalOverviewToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const revisionCollection = [
  {revisionDate: '2023.01.12 13:23', revisionImageUrl: ''},
  {revisionDate: '2023.01.12 13:23', revisionImageUrl: ''},
  {revisionDate: '2023.01.12 13:23', revisionImageUrl: ''},
  {revisionDate: '2023.01.12 13:23', revisionImageUrl: ''}
];

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Main: Story = {
  args: {
    stationId: 'historical_test',
    stationName: 'Historical test',
    collectionId: 'Collection 123',
    revisionCollection: revisionCollection
  },
};
