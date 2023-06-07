import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { Histogram } from './Histogram';

export default {
  component: Histogram,
  title: 'Components/Details Sidebar/Histogram',
} as Meta;

const Template: Story<ComponentProps<typeof Histogram>> = (args) => (
  <Histogram {...args} />
);

export const Default = Template.bind({});

Default.args = {
  data: [
    { range_start: 1, range_end: 2, quantity: 100 },
    { range_start: 2, range_end: 3, quantity: 80 },
    { range_start: 3, range_end: 4, quantity: 90 },
    { range_start: 4, range_end: 5, quantity: 10 },
    { range_start: 5, range_end: 6, quantity: 1 },
    { range_start: 6, range_end: 7, quantity: 20 },
  ],
  unit: '%',
};

export const ThousandQuantities = Template.bind({});

ThousandQuantities.args = {
  data: [
    { range_start: 1, range_end: 2, quantity: 1000 },
    { range_start: 2, range_end: 3, quantity: 2000 },
    { range_start: 3, range_end: 4, quantity: 3000 },
    { range_start: 4, range_end: 5, quantity: 4000 },
    { range_start: 5, range_end: 6, quantity: 5000 },
    { range_start: 6, range_end: 7, quantity: 6000 },
    { range_start: 7, range_end: 8, quantity: 7000 },
    { range_start: 8, range_end: 9, quantity: 8000 },
    { range_start: 9, range_end: 10, quantity: 9000 },
  ],
  unit: '%',
};

export const TensOfThousandQuantities = Template.bind({});

TensOfThousandQuantities.args = {
  data: [
    { range_start: 1, range_end: 2, quantity: 1000 },
    { range_start: 2, range_end: 3, quantity: 2000 },
    { range_start: 3, range_end: 4, quantity: 3000 },
    { range_start: 4, range_end: 5, quantity: 4000 },
    { range_start: 5, range_end: 6, quantity: 5000 },
    { range_start: 6, range_end: 7, quantity: 6000 },
    { range_start: 7, range_end: 8, quantity: 7000 },
    { range_start: 8, range_end: 9, quantity: 8000 },
    { range_start: 9, range_end: 10, quantity: 10000 },
  ],
  unit: '%',
};

export const NoData = Template.bind({});

NoData.args = {
  data: [],
};
