import { ComponentProps } from 'react';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Meta, Story } from '@storybook/react';
import { BenchmarkingFilters } from 'components/BenchmarkingFilters/BenchmarkingFilters';
import { timeFrameOptions } from 'components/BenchmarkingFilters/utils';

import {
  metricFilterOptionsMock,
  typeFilterOptionsMock,
  watercourseFilterOptionsMock,
} from './BenchmarkingFilters.mock';

export default {
  component: BenchmarkingFilters,
  title: 'Components/BenchMarking Day Ahead/Filters',
  argTypes: {
    onWatercourseValueChange: { action: 'Watercourse Value Changed' },
    onTypeValueChange: { action: 'Type Value Changed' },
    onMetricValueChange: { action: 'Metric Value Changed' },
    onTimeFrameValueChange: { action: 'Time Frame Value Changed' },
    onShowFirstRunsChange: { action: 'Show First Runs Value Changed' },
  },
  args: {
    watercourseValue: watercourseFilterOptionsMock[0],
    watercourseFilterOptions: watercourseFilterOptionsMock,
    typeValue: typeFilterOptionsMock[0].label,
    typeFilterOptions: typeFilterOptionsMock,
    metricValue: metricFilterOptionsMock[0],
    metricFilterOptions: metricFilterOptionsMock,
    timeFrameOptions,
    timeFrameValue: timeFrameOptions[0],
    showFirstRuns: true,
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/QlY4FXT7nVnGqwRBOr0yPl/PowerOps-%7C-Working-Environment?node-id=1163%3A130592&t=sdKTfwUYnv6Jve7g-1',
    },
  },
} as Meta;

const Template: Story<ComponentProps<typeof BenchmarkingFilters>> = (args) => (
  <BenchmarkingFilters {...args} />
);

export const Default = Template.bind({});

export const OpenWaterCourseFilter = Template.bind({});
OpenWaterCourseFilter.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const watercourseSelectFilter = await canvas.findByText('Watercourse:');
  userEvent.click(watercourseSelectFilter);
};

export const OpenWaterTypeFilter = Template.bind({});
OpenWaterTypeFilter.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const typeSelectFilter = await canvas.findByTestId(
    'benchmarking-type-button'
  );
  userEvent.click(typeSelectFilter);
};

export const OpenMetricFilter = Template.bind({});
OpenMetricFilter.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const metricSelectFilter = await canvas.findByText('Metric:');
  userEvent.click(metricSelectFilter);
};

export const OpenTimeframeFilter = Template.bind({});
OpenTimeframeFilter.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const timeFrameSelectFilter = await canvas.findByText('Time frame:');
  userEvent.click(timeFrameSelectFilter);
};

export const ShowFirstRunsDisabled = Template.bind({});
ShowFirstRunsDisabled.args = { showFirstRuns: false };

export const Interactions = Template.bind({});

Interactions.play = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);

  // Test watercourse dropdown filter
  const watercourseSelectFilter = await canvas.findByText('Watercourse:');
  userEvent.click(watercourseSelectFilter);
  const selectedWatercourse = await canvas.findByText(
    watercourseFilterOptionsMock[1].label
  );
  userEvent.click(selectedWatercourse);
  expect(args.onWatercourseValueChange).toBeCalled();

  // Test type dropdown filter
  const typeSelectFilter = await canvas.findByTestId(
    'benchmarking-type-button'
  );
  userEvent.click(typeSelectFilter);
  const selectedType = await canvas.findByText('Absolute');
  userEvent.click(selectedType);
  expect(args.onTypeValueChange).toBeCalled();

  // Test metric select filter
  const metricSelectFilter = await canvas.findByText('Metric:');
  userEvent.click(metricSelectFilter);
  const selectedMetric = await canvas.findByText(
    metricFilterOptionsMock[1].label
  );
  userEvent.click(selectedMetric);
  expect(args.onMetricValueChange).toBeCalled();

  // Test time frame select filter
  const timeFrameSelectFilter = await canvas.findByText('Time frame:');
  userEvent.click(timeFrameSelectFilter);
  const selectedTimeFrame = await canvas.findByText(timeFrameOptions[1].label);
  userEvent.click(selectedTimeFrame);
  expect(args.onTimeFrameValueChange).toBeCalled();

  // Test show first runs control
  const showFirstRunsSwitch = await canvas.findByTestId('show-first-runs');
  userEvent.click(showFirstRunsSwitch);
  expect(args.onShowFirstRunsChange).toBeCalled();
};
