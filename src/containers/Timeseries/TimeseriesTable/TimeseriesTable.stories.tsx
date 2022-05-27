import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { timeseries } from '../../../stubs/timeseries';
import { TimeseriesTable } from './TimeseriesTable';

export default {
  title: 'Time Series/TimeseriesTable',
  component: TimeseriesTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'text' } },
};

export const Example = args => <TimeseriesTable {...args} />;
Example.args = {
  items: timeseries,
  onItemClicked: action('onItemClicked'),
};

export const ExampleSingleSelect = args => <TimeseriesTable {...args} />;
ExampleSingleSelect.args = {
  selectionMode: 'single',
  items: timeseries,
  onItemClicked: action('onItemClicked'),
};

const Container = styled.div`
  height: 600px;
`;
