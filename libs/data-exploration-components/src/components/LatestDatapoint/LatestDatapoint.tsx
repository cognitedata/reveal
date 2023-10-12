import React, { useState, useEffect, useCallback } from 'react';

import { TimeDisplay } from '@data-exploration/components';

import { Timeseries, DoubleDatapoint, StringDatapoint } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { SpacedRow } from '../Common';
import { InfoCell } from '../InfoGrid/InfoGrid';

export interface LatestDatapointProps {
  timeSeries: Timeseries;
  valueOnly?: boolean;
}
export const LatestDatapoint = ({
  timeSeries,
  valueOnly = false,
}: LatestDatapointProps) => {
  const sdk = useSDK();
  const [latestDatapoint, setLatestDatapoint] = useState<
    DoubleDatapoint | StringDatapoint | undefined
  >({ value: 0, timestamp: new Date(), isString: false } as DoubleDatapoint);

  const fetchLatestDatapoint = useCallback(
    async (timeSeriesId: number) => {
      try {
        const res = await sdk.datapoints.retrieveLatest([{ id: timeSeriesId }]);
        if (res.length) {
          setLatestDatapoint(res[0]?.datapoints[0]);
        }
      } catch (e) {
        setLatestDatapoint(undefined);
      }
    },
    [sdk.datapoints]
  );

  useEffect(() => {
    fetchLatestDatapoint(timeSeries.id);
  }, [timeSeries.id, fetchLatestDatapoint]);

  if (valueOnly) {
    return (
      <>
        {latestDatapoint?.value ?? 'Unavailable'} {timeSeries.unit}
      </>
    );
  }

  return (
    <InfoCell title="Last reading" noBorders>
      <SpacedRow>
        <strong>
          {latestDatapoint?.value ?? 'Unavailable'} {timeSeries.unit}
        </strong>
        <div className="spacer" />
        {latestDatapoint && (
          <TimeDisplay value={latestDatapoint.timestamp} relative withTooltip />
        )}
      </SpacedRow>
    </InfoCell>
  );
};
