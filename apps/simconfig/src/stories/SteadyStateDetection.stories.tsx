/* eslint-disable */
import type { ComponentMeta, ComponentStory } from '@storybook/react';

import { SteadyStateDetectionChart } from 'components/charts/SteadyStateDetectionChart';

const data = [
  {
    timestamp: new Date('2022-06-29T12:41:00.000Z'),
    value: 771.7926720803841,
  },
  {
    timestamp: new Date('2022-06-29T12:50:00.000Z'),
    value: 771.7349389995622,
  },
  {
    timestamp: new Date('2022-06-29T13:06:00.000Z'),
    value: 771.2452842508769,
  },
  {
    timestamp: new Date('2022-06-29T13:09:00.000Z'),
    value: 771.0982532663728,
  },
  {
    timestamp: new Date('2022-06-29T13:14:00.000Z'),
    value: 770.846941086179,
  },
  {
    timestamp: new Date('2022-06-29T13:15:00.000Z'),
    value: 770.8223900980107,
  },
  {
    timestamp: new Date('2022-06-30T00:59:00.000Z'),
    value: 762.2275949391346,
  },
];

export default {
  title: 'Plots',
  component: SteadyStateDetectionChart,
} as ComponentMeta<typeof SteadyStateDetectionChart>;

const Template: ComponentStory<typeof SteadyStateDetectionChart> = (args) => (
  <SteadyStateDetectionChart {...args} />
);

export const SteadyStateDetection = Template.bind({});
SteadyStateDetection.argTypes = {
  height: {
    description:
      'Plot height size. If prop is not provided, default value is 300px.',
  },
  width: {
    description:
      'Plot width size. If prop is not provided, default value is 800px.',
  },
};
SteadyStateDetection.args = {
  granularity: 1,
  minSegmentDistance: 60,
  varianceThreshold: 1,
  slopeThreshold: -3,
  aggregateType: 'average',
  width: 669,
  height: 240,
  yAxisLabel: 'Input sampled for IPR/VLP (psig)',
  data,
};
