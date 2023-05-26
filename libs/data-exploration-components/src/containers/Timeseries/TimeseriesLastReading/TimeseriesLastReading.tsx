import React from 'react';

import { TimeDisplay } from '@data-exploration/components';
import { useTimeseriesLatestDatapointQuery } from '@data-exploration-components/hooks/Timeseries/useTimeseriesLatestDatapointQuery';

import { Body } from '@cognite/cogs.js';

interface Props {
  timeseriesId: number;
}
export const TimeseriesLastReading: React.FC<Props> = ({ timeseriesId }) => {
  const { data } = useTimeseriesLatestDatapointQuery(timeseriesId);

  const datapoint = data?.datapoints?.[0];
  if (!datapoint) {
    return null;
  }

  return (
    <Body level={2}>
      <TimeDisplay value={datapoint.timestamp} relative withTooltip />
    </Body>
  );
};
