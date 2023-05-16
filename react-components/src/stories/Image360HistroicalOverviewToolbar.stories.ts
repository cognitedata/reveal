import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalOverviewToolbar } from '../components';

const meta = {
  title: 'Example/Image360HistoricalOverviewToolbar',
  component: Image360HistoricalOverviewToolbar,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalOverviewToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const mainRevisionCollection = [
  {date: '2023.01.12 13:23', imageUrl: '', index: 0},
  {date: '2024.01.13 13:23', imageUrl: '', index: 1},
  {date: '2025.01.14 13:23', imageUrl: '', index: 2}
];

const secondaryRevisionCollection = [
  {date: '2023.01.12 13:23', imageUrl: '', index: 0},
  {date: '2024.01.13 13:23', imageUrl: '', index: 1},
  {date: '2025.01.14 13:23', imageUrl: '', index: 2},
  {date: '2026.01.15 15:23', imageUrl: '', index: 3},
  {date: '2024.01.16 23:23', imageUrl: '', index: 4},
  {date: '2024.01.17 23:23', imageUrl: '', index: 5},
  {date: '2024.01.18 23:23', imageUrl: '', index: 6}
];

export const Main: Story = {
  args: {
    stationId: 'historical_test',
    stationName: 'Historical test',
    collectionId: 'Collection_123',
    revisionCollection: mainRevisionCollection,
    viewer: undefined
  }
};

export const Secondary: Story = {
  args: {
    stationId: 'historical_test2',
    stationName: 'Historical test2',
    collectionId: 'Collection_1234',
    revisionCollection: secondaryRevisionCollection,
    viewer: undefined
  }
};
