import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { timeseries } from 'stubs/timeseries';
import { ComponentStory } from '@storybook/react';
import { TimeseriesNewTable } from './TimeseriesNewTable';

export default {
  title: 'Time Series/TimeseriesNewTable',
  component: TimeseriesNewTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof TimeseriesNewTable> = args => (
  <TimeseriesNewTable {...args} />
);
Example.args = {
  data: timeseries,
  onRowClick: action('onItemClicked'),
};

const Container = styled.div`
  height: 600px;
`;
