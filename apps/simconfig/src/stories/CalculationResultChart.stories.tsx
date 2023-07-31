/* eslint-disable */

import type { ComponentMeta, ComponentStory } from '@storybook/react';

import { CalculationResultChart } from 'components/charts/CalculationResultChart';

const data = [
  {
    'Gas Rate [MMscf/day]': 0.15,
    'VLP Pressure [psig]': 3235.4,
    'IPR Pressure [psig]': 2538.11,
  },
  {
    'Gas Rate [MMscf/day]': 0.215758,
    'VLP Pressure [psig]': 2956.04,
    'IPR Pressure [psig]': 2538.08,
  },
  {
    'Gas Rate [MMscf/day]': 0.310345,
    'VLP Pressure [psig]': 2677.11,
    'IPR Pressure [psig]': 2538.05,
  },
  {
    'Gas Rate [MMscf/day]': 0.446396,
    'VLP Pressure [psig]': 2403.56,
    'IPR Pressure [psig]': 2538,
  },
  {
    'Gas Rate [MMscf/day]': 0.642092,
    'VLP Pressure [psig]': 2143.73,
    'IPR Pressure [psig]': 2537.93,
  },
  {
    'Gas Rate [MMscf/day]': 0.923578,
    'VLP Pressure [psig]': 1904.02,
    'IPR Pressure [psig]': 2537.83,
  },
  {
    'Gas Rate [MMscf/day]': 1.32846,
    'VLP Pressure [psig]': 1690.62,
    'IPR Pressure [psig]': 2537.69,
  },
  {
    'Gas Rate [MMscf/day]': 1.91085,
    'VLP Pressure [psig]': 1508.48,
    'IPR Pressure [psig]': 2537.48,
  },
  {
    'Gas Rate [MMscf/day]': 2.74854,
    'VLP Pressure [psig]': 1360.78,
    'IPR Pressure [psig]': 2536.86,
  },
  {
    'Gas Rate [MMscf/day]': 3.95348,
    'VLP Pressure [psig]': 1249.13,
    'IPR Pressure [psig]': 2536.75,
  },
  {
    'Gas Rate [MMscf/day]': 5.68664,
    'VLP Pressure [psig]': 1174.6,
    'IPR Pressure [psig]': 2534.35,
  },
  {
    'Gas Rate [MMscf/day]': 8.1796,
    'VLP Pressure [psig]': 1089.04,
    'IPR Pressure [psig]': 2532.4,
  },
  {
    'Gas Rate [MMscf/day]': 11.7655,
    'VLP Pressure [psig]': 1124.64,
    'IPR Pressure [psig]': 2528.72,
  },
  {
    'Gas Rate [MMscf/day]': 16.9233,
    'VLP Pressure [psig]': 1219.85,
    'IPR Pressure [psig]': 2522.38,
  },
  {
    'Gas Rate [MMscf/day]': 24.3423,
    'VLP Pressure [psig]': 1410.15,
    'IPR Pressure [psig]': 2511.3,
  },
  {
    'Gas Rate [MMscf/day]': 35.0137,
    'VLP Pressure [psig]': 1745.4,
    'IPR Pressure [psig]': 2492.06,
  },
  {
    'Gas Rate [MMscf/day]': 50.3633,
    'VLP Pressure [psig]': 2289.16,
    'IPR Pressure [psig]': 2458.16,
  },
  {
    'Gas Rate [MMscf/day]': 72.4421,
    'VLP Pressure [psig]': 3129.32,
    'IPR Pressure [psig]': 2397.69,
  },
  {
    'Gas Rate [MMscf/day]': 104.2,
    'VLP Pressure [psig]': 4418.83,
    'IPR Pressure [psig]': 2289.11,
  },
  {
    'Gas Rate [MMscf/day]': 149.88,
    'VLP Pressure [psig]': 6461.98,
    'IPR Pressure [psig]': 2090.96,
  },
];

export default {
  title: 'Plots',
  component: CalculationResultChart,
} as ComponentMeta<typeof CalculationResultChart>;

const Template: ComponentStory<typeof CalculationResultChart> = (args) => (
  <CalculationResultChart {...args} />
);

export const CalculationResult = Template.bind({});
CalculationResult.argTypes = {
  height: {
    description:
      'Plot height size. If prop is not provided, default value is 300px.',
  },
  width: {
    description:
      'Plot width size. If prop is not provided, default value is 800px.',
  },
};
CalculationResult.args = {
  height: 300,
  width: 800,
  xAxisLabel: 'Gas Rate [MMscf/day]',
  yAxisLabel: 'Pressure [psig]',
  data,
  yAxisColumns: ['VLP Pressure [psig]', 'IPR Pressure [psig]'],
  xAxisColumn: 'Gas Rate [MMscf/day]',
};
