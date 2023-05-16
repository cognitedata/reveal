import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalOverviewToolbar } from '../components';
import { Cognite3DViewer, Cognite3DViewerOptions } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';


const meta = {
  title: 'Example/Image360HistoricalOverviewToolbar',
  component: Image360HistoricalOverviewToolbar,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalOverviewToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const revisionCollection = [
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
    collectionId: 'Collection 123',
    revisionCollection: revisionCollection,
    viewer: undefined
  },
};

export const Secondary: Story = {
  args: {
    stationId: 'historical_test2',
    stationName: 'Historical test2',
    collectionId: 'Collection 1234',
    revisionCollection: revisionCollection,
    viewer: undefined
  },
};
