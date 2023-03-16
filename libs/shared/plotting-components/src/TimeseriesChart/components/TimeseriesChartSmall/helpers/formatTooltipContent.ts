import { DatapointAggregate } from '@cognite/sdk';

import dayjs from 'dayjs';

import { TooltipRendererProps } from '../../../../LineChart';

export const formatTooltipContent = ({ customData }: TooltipRendererProps) => {
  const datapoint = customData as DatapointAggregate;
  const { average, timestamp } = datapoint;

  return {
    Average: average?.toFixed(3),
    Date: dayjs(timestamp).format('DD.MM.YYYY'),
  };
};
