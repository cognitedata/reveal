import {
  Config,
  Data,
  HoverLineData,
  TooltipDetailProps,
  TooltipRendererProps,
} from '@cognite/plotting-components';
import { Datapoints } from '@cognite/sdk/dist/src';

import { formatDateDatum, getScore } from './validationTimeseries';

export const chartConfig: Partial<Config> = {
  responsive: true,
  scrollZoom: 'x',
  selectionZoom: [
    { trigger: 'default', direction: 'x+y' },
    { trigger: 'Shift', direction: 'x' },
  ],
  buttonZoom: 'x',
};

export const formatScoreDot = ({ x, y }: HoverLineData) =>
  `${formatDateDatum(x)}, score = ${y}%`;

export const formatScoreDotTooltip = ({
  x,
  y,
}: TooltipRendererProps): TooltipDetailProps[] => [
  {
    label: `${formatDateDatum(x)}, score`,
    value: `${y}%`,
  },
];

export const formatInstancesDot = ({ x, y }: HoverLineData) =>
  `${formatDateDatum(x)}, instances = ${y}`;

export const getScoreChartData = (
  scoreDatapoints?: Datapoints,
  chartName?: string
) => {
  return {
    x: scoreDatapoints?.datapoints?.map((dp) => dp.timestamp) ?? [],
    y: scoreDatapoints?.datapoints?.map((dp) => getScore(dp.value)) ?? [],
    color: 'purple',
    name: chartName,
  } as Data;
};

export const getTotalItemsChartData = (
  totalInstancesDatapoints?: Datapoints,
  chartName?: string
) => {
  return {
    x: totalInstancesDatapoints?.datapoints?.map((dp) => dp.timestamp) ?? [],
    y: totalInstancesDatapoints?.datapoints?.map((dp) => dp.value) ?? [],
    color: 'blue',
    name: chartName,
  } as Data;
};
