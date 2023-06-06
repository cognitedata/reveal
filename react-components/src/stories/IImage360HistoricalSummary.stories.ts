import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalSummary } from '../components/Toolbar';

const meta = {
  title: 'Example/Image360HistoricalSummary',
  component: Image360HistoricalSummary,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

const mainRevisionCollection = [
  {date: undefined, imageUrl: '', index: 0, image360Entity: undefined},
  {date: '2024.01.13 13:23', imageUrl: '', index: 1, image360Entity: undefined},
  {date: '2025.01.14 13:23', imageUrl: '', index: 2, image360Entity: undefined}
];

const secondaryRevisionCollection = [
  {date: ' ', imageUrl: '', index: 0, image360Entity: undefined},
  {date: '2024.01.13 13:23', imageUrl: undefined, index: 1, image360Entity: undefined},
  {date: '2025.01.14 13:23', imageUrl: '', index: 2, image360Entity: undefined},
  {date: '2026.01.15 15:23', imageUrl: '', index: 3, image360Entity: undefined},
  {date: '2024.01.16 23:23', imageUrl: '', index: 4, image360Entity: undefined},
  {date: '2024.01.17 23:23', imageUrl: '', index: 5, image360Entity: undefined},
  {date: '2024.01.18 23:23', imageUrl: '', index: 6, image360Entity: undefined}
];

export const Main: Story = {
  args: {
    stationId: 'historical_test',
    stationName: 'Historical test',
    revisionCollection: mainRevisionCollection,
    viewer: undefined,
    setActiveRevision(index) {},
    activeRevision: 0
  }
};

export const Secondary: Story = {
  args: {
    stationId: 'historical_test2',
    stationName: 'Historical test2',
    revisionCollection: secondaryRevisionCollection,
    viewer: undefined,
    setActiveRevision(index) {},
    activeRevision: 0
  }
};
