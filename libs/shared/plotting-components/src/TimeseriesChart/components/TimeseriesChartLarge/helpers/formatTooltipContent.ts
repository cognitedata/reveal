import { DatapointAggregate } from '@cognite/sdk';

import { TooltipRendererProps } from '../../../../LineChart';

export const formatTooltipContent = ({ customData }: TooltipRendererProps) => {
  const datapoint = customData as DatapointAggregate;
  const { average, max, min, count } = datapoint;

  return {
    Min: min?.toFixed(3),
    Max: max?.toFixed(3),
    Average: average?.toFixed(3),
    Count: count,
  };
};
