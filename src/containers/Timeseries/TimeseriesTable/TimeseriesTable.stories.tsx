import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { timeseries } from 'stubs/timeseries';
import { ComponentStory } from '@storybook/react';
import { TimeseriesTable } from './TimeseriesTable';

export default {
  title: 'Time Series/TimeseriesTable',
  component: TimeseriesTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example: ComponentStory<typeof TimeseriesTable> = args => (
  <TimeseriesTable {...args} />
);
Example.args = {
  data: timeseries,
  onRowClick: action('onItemClicked'),
};

const Container = styled.div`
  height: 600px;
`;
