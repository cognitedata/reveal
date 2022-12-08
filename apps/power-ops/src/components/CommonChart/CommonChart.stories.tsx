import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import {
  chartStyles,
  layout,
} from 'components/DayAheadBenchmarkingChart/chartConfig';

import { CommonChart } from './CommonChart';

export default {
  component: CommonChart,
  title: 'Components/Common Chart',
  argTypes: {
    onHover: { action: 'Hover' },
    onUnhover: { action: 'Unhover' },
  },
  args: {
    title: 'Common Chart',
    subTitle: 'Test',
    data: [
      {
        dataTestid: 'line-one',
        name: 'Test data',
        title: 'line-one',
        x: [
          '2022-10-05',
          '2022-10-06',
          '2022-10-07',
          '2022-10-08',
          '2022-10-09',
        ],
        y: [5, 4, 3, 2, 1],
      },
    ],
    layout,
    chartStyles,
  },
} as Meta;

const Template: Story<ComponentProps<typeof CommonChart>> = (args) => (
  <CommonChart {...args} />
);

export const Default = Template.bind({});
