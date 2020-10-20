import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { timeseries } from 'stubs/timeseries';
import { TimeseriesSmallPreview } from './TimeseriesSmallPreview';

export default {
  title: 'Time Series/TimeseriesSmallPreview',
  component: TimeseriesSmallPreview,
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
  <TimeseriesSmallPreview timeseriesId={timeseries[0].id} />
);

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  width: 300px;
  display: flex;
`;
