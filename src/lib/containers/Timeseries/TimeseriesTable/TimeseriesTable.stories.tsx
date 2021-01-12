import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { timeseries } from 'lib/stubs/timeseries';
import { TimeseriesTable } from './TimeseriesTable';

export default {
  title: 'Time Series/TimeseriesTable',
  component: TimeseriesTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return (
    <TimeseriesTable
      items={timeseries}
      onItemClicked={action('onItemClicked')}
      query={text('query', '')}
    />
  );
};
export const ExampleSingleSelect = () => {
  return (
    <TimeseriesTable
      selectionMode="single"
      items={timeseries}
      onItemClicked={action('onItemClicked')}
      query={text('query', '')}
    />
  );
};

const Container = styled.div`
  height: 600px;
`;
