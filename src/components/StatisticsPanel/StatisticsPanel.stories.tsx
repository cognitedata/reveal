import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import StatisticsPanel from './StatisticsPanel';

export default {
  component: StatisticsPanel,
  title: 'Components/Details Sidebar/Statistics Panel',
} as Meta;

const Template: Story<ComponentProps<typeof StatisticsPanel>> = (args) => (
  <div style={{ maxWidth: '25rem' }}>
    <StatisticsPanel {...args} />
  </div>
);

export const Default = Template.bind({});

Default.args = {
  loading: false,
  min: 1,
  max: 1,
  mean: 1,
  median: 1,
  std: 1,
  q25: 1,
  q50: 1,
  q75: 1,
  skewness: 1,
  kurtosis: 1,
  histogram: [
    { rangeStart: 1, rangeEnd: 2, quantity: 100 },
    { rangeStart: 2, rangeEnd: 3, quantity: 80 },
    { rangeStart: 3, rangeEnd: 4, quantity: 90 },
    { rangeStart: 4, rangeEnd: 5, quantity: 10 },
    { rangeStart: 5, rangeEnd: 6, quantity: 1 },
    { rangeStart: 6, rangeEnd: 7, quantity: 20 },
  ],
  unit: '%',
};

export const Loading = Template.bind({});

Loading.args = {
  loading: true,
};

export const Error = Template.bind({});

Error.args = {
  loading: false,
  error: 'Operation Cancelled',
};
