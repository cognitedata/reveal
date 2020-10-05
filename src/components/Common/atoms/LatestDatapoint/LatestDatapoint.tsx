import React, { useState, useEffect, useCallback } from 'react';
import { InfoCell, SpacedRow, TimeDisplay } from 'components/Common';
import { Timeseries, DoubleDatapoint, StringDatapoint } from '@cognite/sdk';
import { getSDK } from 'utils/SDK';

interface LatestDatapointProps {
  timeSeries: Timeseries;
}
export const LatestDatapoint = ({ timeSeries }: LatestDatapointProps) => {
  const sdk = getSDK();
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
