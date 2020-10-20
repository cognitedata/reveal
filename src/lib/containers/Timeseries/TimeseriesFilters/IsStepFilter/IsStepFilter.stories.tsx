import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { timeseries } from 'stubs/timeseries';
import { IsStepFilter } from './IsStepFilter';

export default {
  title: 'Search Results/Filters/Time Series/IsStepFilter',
  component: IsStepFilter,
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
export const Example = () => <IsStepFilter />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;
