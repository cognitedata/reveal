import { TooltipRendererProps } from '../../../../LineChart';
import { TimeseriesDatapoint } from '../../../domain/service/types';
import { TFunction } from '../../../i18n/useTranslation';
import { getFormattedDateWithTimezone } from '../../../utils/getFormattedDateWithTimezone';
import { getTooltipNumericValue } from '../../../utils/getTooltipNumericValue';
import { getTooltipRawDatapointValue } from '../../../utils/getTooltipRawDatapointValue';

export const formatTooltipContent = (
  { customData }: TooltipRendererProps,
  unit: string | undefined,
  t: TFunction
) => {
  const datapoint = customData as TimeseriesDatapoint;

  if ('value' in datapoint) {
    return [
      {
        label: t('VALUE', 'Value'),
        value: getTooltipRawDatapointValue(datapoint.value, unit),
      },
    ];
  }

  const { average, timestamp } = datapoint;

  return [
    {
      label: t('AVERAGE', 'Average'),
      value: getTooltipNumericValue(average, unit),
    },
    {
      label: t('DATE', 'Date'),
      value: getFormattedDateWithTimezone(timestamp),
    },
  ];
};
