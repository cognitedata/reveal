import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { timeseries } from 'stubs/timeseries';
import { IsStringFilter } from './IsStringFilter';

export default {
  title: 'Search Results/Filters/Time Series/IsStringFilter',
  component: IsStringFilter,
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
export const Example = () => <IsStringFilter />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;
