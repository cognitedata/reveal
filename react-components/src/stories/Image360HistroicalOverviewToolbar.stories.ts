import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalOverviewToolbar } from '../components';
import { Cognite3DViewer, Cognite3DViewerOptions } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Example/Image360HistoricalOverviewToolbar',
  component: Image360HistoricalOverviewToolbar,
  tags: ['autodocs'],
} satisfies Meta<typeof Image360HistoricalOverviewToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const revisionCollection = [
  {revisionDate: '2023.01.12 13:23', revisionImageUrl: '', index: 0},
  {revisionDate: '2024.01.13 13:23', revisionImageUrl: '', index: 1},
  {revisionDate: '2025.01.14 13:23', revisionImageUrl: '', index: 2},
  {revisionDate: '2026.01.15 15:23', revisionImageUrl: '', index: 3},
  {revisionDate: '2024.01.16 23:23', revisionImageUrl: '', index: 4},
  {revisionDate: '2024.01.17 23:23', revisionImageUrl: '', index: 5},
  {revisionDate: '2024.01.18 23:23', revisionImageUrl: '', index: 6}
];

const viewerOptions: Cognite3DViewerOptions = {
  sdk: new CogniteClient({
        appId: 'cognite.reveal.unittest',
        project: 'dummy',
        getToken: async () => 'dummy'
      }),
  domElement: undefined
};

const viewer = new Cognite3DViewer(viewerOptions);

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Main: Story = {
  args: {
    stationId: 'historical_test',
    stationName: 'Historical test',
    collectionId: 'Collection 123',
    revisionCollection: revisionCollection,
    viewer: viewer
  },
};
