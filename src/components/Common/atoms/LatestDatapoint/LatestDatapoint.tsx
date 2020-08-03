import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { InfoCell } from 'components/Common';
import { Row, Col } from 'antd';
import {
  GetTimeSeriesMetadataDTO as TimeSeries,
  GetDoubleDatapoint,
  GetStringDatapoint,
} from '@cognite/sdk';

import sdk from 'sdk-singleton';

interface LatestDatapointProps {
  timeSeries: TimeSeries;
}
export const LatestDatapoint = ({ timeSeries }: LatestDatapointProps) => {
  const [latestDatapoint, setLatestDatapoint] = useState<
    GetDoubleDatapoint | GetStringDatapoint | undefined
  >({ value: 0, timestamp: new Date(), isString: false } as GetDoubleDatapoint);

  const fetchLatestDatapoint = async (timeSeriesId: number) => {
    try {
      const res = await sdk.datapoints.retrieveLatest([{ id: timeSeriesId }]);
      if (res.length) {
        setLatestDatapoint(res[0]?.datapoints[0]);
      }
    } catch (e) {
      setLatestDatapoint(undefined);
    }
  };

  useEffect(() => {
    fetchLatestDatapoint(timeSeries.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeSeries.id]);

  return (
    <InfoCell title="Last reading" noBorders>
      <Row type="flex" justify="space-between">
        <Col>
          <strong>
            {latestDatapoint?.value ?? 'Unavailable'} {timeSeries.unit}
          </strong>
        </Col>
        <Col>
          {latestDatapoint && moment(latestDatapoint.timestamp).fromNow()}
        </Col>
      </Row>
    </InfoCell>
  );
};
