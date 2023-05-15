import { TooltipRendererProps } from '../../../../LineChart';
import { TimeseriesDatapoint } from '../../../domain/service/types';
import { getFormattedDateWithTimezone } from '../../../utils/getFormattedDateWithTimezone';
import { getTooltipNumericValue } from '../../../utils/getTooltipNumericValue';
import { getTooltipRawDatapointValue } from '../../../utils/getTooltipRawDatapointValue';

export const formatTooltipContent = (
  { customData }: TooltipRendererProps,
  unit?: string
) => {
  const datapoint = customData as TimeseriesDatapoint;

  if ('value' in datapoint) {
    return [
      {
        label: 'Value',
        value: getTooltipRawDatapointValue(datapoint.value, unit),
      },
    ];
  }

  const { average, timestamp } = datapoint;

  return [
    { label: 'Average', value: getTooltipNumericValue(average, unit) },
    { label: 'Date', value: getFormattedDateWithTimezone(timestamp) },
  ];
};
