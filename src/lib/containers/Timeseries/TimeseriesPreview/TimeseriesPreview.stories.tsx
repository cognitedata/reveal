import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { timeseries } from 'stubs/timeseries';
import { TimeseriesPreview } from './TimeseriesPreview';

export default {
  title: 'Time Series/TimeseriesPreview',
  component: TimeseriesPreview,
  decorators: [
    (storyFn: any) => (
      <Container>
        <DataExplorationProvider sdk={sdkMock}>
          {storyFn()}
        </DataExplorationProvider>
      </Container>
    ),
  ],
};
const sdkMock = {
  post: async () => ({ data: { items: timeseries } }),
};
export const Example = () => (
  <TimeseriesPreview timeseriesId={timeseries[0].id} />
);

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;
