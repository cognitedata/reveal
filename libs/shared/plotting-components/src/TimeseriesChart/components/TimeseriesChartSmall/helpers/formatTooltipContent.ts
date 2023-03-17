import { DatapointAggregate } from '@cognite/sdk';

import { TooltipRendererProps } from '../../../../LineChart';
import { getFormattedDateWithTimezone } from '../../../utils/getFormattedDateWithTimezone';
import { getTooltipNumericValue } from '../../../utils/getTooltipNumericValue';

export const formatTooltipContent = ({ customData }: TooltipRendererProps) => {
  const datapoint = customData as DatapointAggregate;
  const { average, timestamp } = datapoint;

  return [
    { label: 'Average', value: getTooltipNumericValue(average) },
    { label: 'Date', value: getFormattedDateWithTimezone(timestamp) },
  ];
};
