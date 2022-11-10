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
  onItemClicked: action('onItemClicked'),
};

export const ExampleSingleSelect: ComponentStory<
  typeof TimeseriesTable
> = args => <TimeseriesTable {...args} />;
ExampleSingleSelect.args = {
  items: timeseries,
  onItemClicked: action('onItemClicked'),
};

export const HideEmpty: ComponentStory<typeof TimeseriesTable> = args => (
  <TimeseriesTable {...args} />
);
HideEmpty.args = {
  data: timeseries,
  onItemClicked: action('onItemClicked'),
  hideEmptyData: true,
};

const Container = styled.div`
  height: 600px;
`;
