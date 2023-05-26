import React from 'react';

import { TimeDisplay } from '@data-exploration/components';
import { useTimeseriesLatestDataPointQuery } from '@data-exploration-lib/domain-layer';

import { Body } from '@cognite/cogs.js';

interface Props {
  timeseriesId: number;
}
export const TimeseriesLastReading: React.FC<Props> = ({ timeseriesId }) => {
  const { data } = useTimeseriesLatestDataPointQuery([{ id: timeseriesId }]);

  const datapoint = data?.[0].datapoints[0];
  if (!datapoint) {
    return null;
  }

  return (
    <Body level={2}>
      <TimeDisplay value={datapoint.timestamp} relative withTooltip />
    </Body>
  );
};
