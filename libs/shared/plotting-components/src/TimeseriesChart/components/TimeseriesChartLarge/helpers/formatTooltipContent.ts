import { TooltipRendererProps } from '../../../../LineChart';
import { TimeseriesDatapoint } from '../../../domain/service/types';
import { getTooltipNumericValue } from '../../../utils/getTooltipNumericValue';
import { getTooltipRawDatapointValue } from '../../../utils/getTooltipRawDatapointValue';

export const formatTooltipContent = (
  { customData }: TooltipRendererProps,
  unit?: string
) => {
  const datapoint = customData as TimeseriesDatapoint;

  if (!datapoint) {
    return [];
  }

  if ('value' in datapoint) {
    return [
      {
        label: 'Value',
        value: getTooltipRawDatapointValue(datapoint.value, unit),
      },
    ];
  }

  const { average, max, min, count } = datapoint;

  return [
    { label: 'Min', value: getTooltipNumericValue(min, unit) },
    { label: 'Max', value: getTooltipNumericValue(max, unit) },
    { label: 'Average', value: getTooltipNumericValue(average, unit) },
    { label: 'Count', value: count },
  ];
};
