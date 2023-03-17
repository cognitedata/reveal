import { DatapointAggregate } from '@cognite/sdk';

import { HoverLineData } from '../../../../LineChart';
import { getFormattedDateWithTimezone } from '../../../utils/getFormattedDateWithTimezone';

export const formatHoverLineInfo = ({ customData }: HoverLineData) => {
  const datapoint = customData as DatapointAggregate;
  const { timestamp } = datapoint;

  return getFormattedDateWithTimezone(timestamp);
};
