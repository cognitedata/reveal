import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { timeseries } from 'stubs/timeseries';
import { UnitFilter } from './UnitFilter';

export default {
  title: 'Search Results/Filters/Time Series/UnitFilter',
  component: UnitFilter,
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
export const Example = () => <UnitFilter items={timeseries} />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;
