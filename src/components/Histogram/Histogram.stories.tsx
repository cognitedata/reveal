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
  loading: false,
  data: [
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

export const NoData = Template.bind({});

NoData.args = {
  data: [],
  loading: false,
};

export const ThousandQuantities = Template.bind({});

ThousandQuantities.args = {
  data: [
    { rangeStart: 1, rangeEnd: 2, quantity: 1000 },
    { rangeStart: 2, rangeEnd: 3, quantity: 2000 },
    { rangeStart: 3, rangeEnd: 4, quantity: 3000 },
    { rangeStart: 4, rangeEnd: 5, quantity: 4000 },
    { rangeStart: 5, rangeEnd: 6, quantity: 5000 },
    { rangeStart: 6, rangeEnd: 7, quantity: 6000 },
    { rangeStart: 7, rangeEnd: 8, quantity: 7000 },
    { rangeStart: 8, rangeEnd: 9, quantity: 8000 },
    { rangeStart: 9, rangeEnd: 10, quantity: 9000 },
  ],
  unit: '%',
};

export const TensOfThousandQuantities = Template.bind({});

TensOfThousandQuantities.args = {
  data: [
    { rangeStart: 1, rangeEnd: 2, quantity: 1000 },
    { rangeStart: 2, rangeEnd: 3, quantity: 2000 },
    { rangeStart: 3, rangeEnd: 4, quantity: 3000 },
    { rangeStart: 4, rangeEnd: 5, quantity: 4000 },
    { rangeStart: 5, rangeEnd: 6, quantity: 5000 },
    { rangeStart: 6, rangeEnd: 7, quantity: 6000 },
    { rangeStart: 7, rangeEnd: 8, quantity: 7000 },
    { rangeStart: 8, rangeEnd: 9, quantity: 8000 },
    { rangeStart: 9, rangeEnd: 10, quantity: 10000 },
  ],
  unit: '%',
};
