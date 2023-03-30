import { HoverLineData } from '../../../../LineChart';
import { TimeseriesDatapoint } from '../../../domain/service/types';
import { getFormattedDateWithTimezone } from '../../../utils/getFormattedDateWithTimezone';

export const formatHoverLineInfo = ({ customData }: HoverLineData) => {
  const datapoint = customData as TimeseriesDatapoint;
  const { timestamp } = datapoint;

  return getFormattedDateWithTimezone(timestamp);
};
