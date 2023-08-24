import { TooltipRendererProps } from '../../../../LineChart';
import { TFunction } from '../../../../useTranslation';
import { TimeseriesDatapoint } from '../../../domain/service/types';
import { getTooltipNumericValue } from '../../../utils/getTooltipNumericValue';
import { getTooltipRawDatapointValue } from '../../../utils/getTooltipRawDatapointValue';

export const formatTooltipContent = (
  { customData }: TooltipRendererProps,
  unit: string | undefined,
  t: TFunction
) => {
  const datapoint = customData as TimeseriesDatapoint;

  if (!datapoint) {
    return [];
  }

  if ('value' in datapoint) {
    return [
      {
        label: t('VALUE', 'Value'),
        value: getTooltipRawDatapointValue(datapoint.value, unit),
      },
    ];
  }

  const { average, max, min, count } = datapoint;

  return [
    { label: t('MIN', 'Min'), value: getTooltipNumericValue(min, unit) },
    { label: t('MAX', 'Max'), value: getTooltipNumericValue(max, unit) },
    {
      label: t('AVERAGE', 'Average'),
      value: getTooltipNumericValue(average, unit),
    },
    { label: t('COUNT', 'Count'), value: count },
  ];
};
