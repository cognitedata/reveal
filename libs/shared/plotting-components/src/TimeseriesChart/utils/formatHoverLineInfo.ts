import { DatapointAggregate } from '@cognite/sdk';

import dayjs from 'dayjs';

import { HoverLineData } from '../../LineChart';

export const formatHoverLineInfo = ({ customData }: HoverLineData) => {
  const datapoint = customData as DatapointAggregate;
  const { timestamp } = datapoint;

  const date = dayjs(timestamp).format('DD.MM.YYYY');

  return `${date}`;
};
