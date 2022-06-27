import { Meta, Story } from '@storybook/react';
import dayjs from 'dayjs';
import React from 'react';
import { TSList } from './elements/TSList';
import TimeSeriesResultItem from './TimeSeriesResultItem';

type Props = React.ComponentProps<typeof TimeSeriesResultItem>;

export default {
  component: TimeSeriesResultItem,
  title: 'Components/File View Page/Time Series Result',
  argTypes: {
    onCheckboxClick: { action: 'Checked the timeseries' },
  },
} as Meta;

const Template: Story<Props> = (args) => (
  <TSList>
    <TimeSeriesResultItem {...args} />
  </TSList>
);

export const Default = Template.bind({});

Default.args = {
  externalId: 'timeseries',
  name: 'Timeseries 1',
  description: 'Test for a time series with a very long description',
  sparkline: {
    startDate: dayjs('1989-12-22T00:00:00Z').toDate(),
    endDate: dayjs('1989-12-22T00:00:00Z').subtract(-99, 'minute').toDate(),
    datapoints: Array(100)
      .fill(1)
      .map((_v, i) => ({
        timestamp: dayjs('1989-12-22T00:00:00Z').add(i, 'minute').toDate(),
        average: i % 10,
        min: (i % 10) / 2,
        max: (i % 10) * 2,
      })),
  },
};

export const Checked = Template.bind({});

Checked.args = {
  ...Default.args,
  checked: true,
};

export const Disabled = Template.bind({});

Disabled.args = {
  ...Default.args,
  disabled: true,
  checkboxTooltip: 'String-type timeseries cannot be selected',
};

export const ExactMatch = Template.bind({});

ExactMatch.args = {
  ...Default.args,
  isExact: true,
};

export const Loading = Template.bind({});

Loading.args = {
  ...Default.args,
  loading: true,
  sparkline: {
    startDate: new Date(1655483622215),
    endDate: new Date(1655483622215),
    datapoints: [],
    loading: true,
  },
};
