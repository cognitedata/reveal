import { TooltipRendererProps } from '../../../../LineChart';
import { TimeseriesDatapoint } from '../../../domain/service/types';
import { getTooltipNumericValue } from '../../../utils/getTooltipNumericValue';

export const formatTooltipContent = ({ customData }: TooltipRendererProps) => {
  const datapoint = customData as TimeseriesDatapoint;

  if ('value' in datapoint) {
    return [{ label: 'Value', value: datapoint.value }];
  }

  const { average, max, min, count } = datapoint;

  return [
    { label: 'Min', value: getTooltipNumericValue(min) },
    { label: 'Max', value: getTooltipNumericValue(max) },
    { label: 'Average', value: getTooltipNumericValue(average) },
    { label: 'Count', value: count },
  ];
};
