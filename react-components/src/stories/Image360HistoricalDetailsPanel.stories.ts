import type { Meta, StoryObj } from '@storybook/react';
import { Image360HistoricalDetailsPanel } from '../components';
import { Cognite3DViewer, Cognite3DViewerOptions } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';


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
    revisionCount: 5,
    revisionDetailsMode: undefined,
    setRevisionDetailsMode: undefined
  },
};
