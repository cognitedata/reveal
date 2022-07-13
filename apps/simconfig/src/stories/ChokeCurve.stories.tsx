/* eslint-disable */
import type { ComponentMeta, ComponentStory } from '@storybook/react';

import { ChokeCurveChart } from 'components/charts/ChokeCurveChart';
import type { OrdinalDatum } from 'components/charts/types';

const data = {
  chokeCurve: {
    opening: ['', 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    setting: [0, 2.5, 2.7, 2.89, 2.6, 2.32, 5, 5.2, 5.78, 6.12, 5.9],
    unit: '64ths inch',
    unitType: 'Diameter',
  },
};

export default {
  title: 'Plots',
  component: ChokeCurveChart,
} as ComponentMeta<typeof ChokeCurveChart>;

const Template: ComponentStory<typeof ChokeCurveChart> = (args) => (
  <ChokeCurveChart {...args} />
);

export const ChokeCurve = Template.bind({});
ChokeCurve.args = {
  height: 500,
  width: 500,
  xAxisLabel: 'Valve opening (%)',
  yAxisLabel: `Choke setting (${data.chokeCurve.unit})`,
  data: data.chokeCurve.opening.map((x, index) => ({
    x,
    y: data.chokeCurve.setting[index],
  })) as OrdinalDatum[],
};
