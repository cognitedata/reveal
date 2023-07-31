/* eslint-disable */
import type { ComponentMeta, ComponentStory } from '@storybook/react';

import type { DatapointAggregate } from '@cognite/sdk';

import { TimeseriesChart } from 'components/charts/TimeseriesChart';

const datapoints: DatapointAggregate[] = [
  {
    timestamp: new Date(1655053980000),
    average: 9.960416462538129,
    min: 9.960416462538129,
    max: 9.960416462538129,
  },
  {
    timestamp: new Date(1655057580000),
    average: 10.751531429250585,
    min: 10.751531429250585,
    max: 10.751531429250585,
  },
  {
    timestamp: new Date(1655061240000),
    average: 15.672559527745271,
    min: 15.564147476751343,
    max: 15.564147476751343,
  },
  {
    timestamp: new Date(1655062860000),
    average: 21.4183982304235,
    min: 21.4183982304235,
    max: 21.4183982304235,
  },
  {
    timestamp: new Date(1655075640000),
    average: 10.883383923702654,
    min: 10.883383923702654,
    max: 10.883383923702654,
  },
  {
    timestamp: new Date(1655079240000),
    average: 24.991600830074738,
    min: 24.991600830074738,
    max: 24.991600830074738,
  },
  {
    timestamp: new Date(1655082840000),
    average: 1.3072968493605508,
    min: 1.1262993342490653,
    max: 1.1262993342490653,
  },
  {
    timestamp: new Date(1655086140000),
    average: 21.03602599651247,
    min: 21.03602599651247,
    max: 21.03602599651247,
  },
  {
    timestamp: new Date(1655090040000),
    average: 5.4059184338376225,
    min: 5.21372666226341,
    max: 5.21372666226341,
  },
  {
    timestamp: new Date(1655093580000),
    average: 27.892355708020418,
    min: 27.892355708020418,
    max: 27.892355708020418,
  },
  {
    timestamp: new Date(1655097300000),
    average: 15.630073723977377,
    min: 15.630073723977377,
    max: 15.630073723977377,
  },
  {
    timestamp: new Date(1655100900000),
    average: 0.11543021011648769,
    min: 0.11543021011648769,
    max: 0.11543021011648769,
  },
  {
    timestamp: new Date(1655104500000),
    average: 2.6311927084280438,
    min: 2.7744555149000103,
    max: 2.7744555149000103,
  },
  {
    timestamp: new Date(1655106060000),
    average: -4.675210421642257,
    min: -4.675210421642257,
    max: -4.675210421642257,
  },
  {
    timestamp: new Date(1655118900000),
    average: 27.804454045052346,
    min: 27.804454045052346,
    max: 27.804454045052346,
  },
  {
    timestamp: new Date(1655122500000),
    average: 31.111375227746947,
    min: 31.32052056377438,
    max: 31.32052056377438,
  },
  {
    timestamp: new Date(1655125980000),
    average: 7.0647765520496595,
    min: 7.059661584592467,
    max: 7.059661584592467,
  },
  {
    timestamp: new Date(1655129460000),
    average: 7.838190631379948,
    min: 7.652997809626806,
    max: 7.652997809626806,
  },
  {
    timestamp: new Date(1655132760000),
    average: 28.024208202472487,
    min: 28.024208202472487,
    max: 28.024208202472487,
  },
  {
    timestamp: new Date(1655136840000),
    average: 31.452373058226442,
    min: 31.452373058226442,
    max: 31.452373058226442,
  },
];

// eslint-disable-next-line import/no-anonymous-default-export
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  title: 'Plots',
  component: TimeseriesChart,
} as ComponentMeta<typeof TimeseriesChart>;

const Template: ComponentStory<typeof TimeseriesChart> = (args) => (
  <TimeseriesChart {...args} />
);

export const TimeSeriesChart = Template.bind({});
TimeSeriesChart.argTypes = {
  height: {
    description:
      'Plot height size. If prop is not provided, default value is 300px.',
  },
  width: {
    description:
      'Plot width size. If prop is not provided, default value is 800px.',
  },
  aggregateType: {
    control: 'select',
    options: ['average', 'stepInterpolation', 'interpolation'],
  },
};
TimeSeriesChart.args = {
  aggregateType: 'average',
  height: 300,
  width: 700,
  fullSize: true,
  yAxisLabel: 'unit',
  data: datapoints,
};
