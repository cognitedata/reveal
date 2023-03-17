import { DatapointAggregate } from '@cognite/sdk';

import { TooltipRendererProps } from '../../../../LineChart';
import { getTooltipNumericValue } from '../../../utils/getTooltipNumericValue';

export const formatTooltipContent = ({ customData }: TooltipRendererProps) => {
  const datapoint = customData as DatapointAggregate;
  const { average, max, min, count } = datapoint;

  return [
    { label: 'Min', value: getTooltipNumericValue(min) },
    { label: 'Max', value: getTooltipNumericValue(max) },
    { label: 'Average', value: getTooltipNumericValue(average) },
    { label: 'Count', value: count },
  ];
};
