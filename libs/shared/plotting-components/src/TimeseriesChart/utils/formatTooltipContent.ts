import { DatapointAggregate } from '@cognite/sdk';
import { TooltipRendererProps } from '../../LineChart';

export const formatTooltipContent = ({ customData }: TooltipRendererProps) => {
  const datapoint = customData as DatapointAggregate;
  const { average, max, min, count } = datapoint;

  return {
    min: min?.toFixed(3),
    max: max?.toFixed(3),
    average: average?.toFixed(3),
    count,
  };
};
