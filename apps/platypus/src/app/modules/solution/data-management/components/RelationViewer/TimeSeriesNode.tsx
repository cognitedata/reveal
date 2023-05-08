import { TimeseriesChart } from '@cognite/plotting-components';
import { getCogniteSDKClient } from '../../../../../../environments/cogniteSdk';
import { useEffect, useMemo, useState } from 'react';
import { Button, Flex } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';

const DEFAULT_RANGE = [
  {
    timestamp: `${
      new Date().getFullYear() - 10
    }-${new Date().getMonth()}-${new Date().getDay()}`,
    value: 0,
  },
  { timestamp: new Date().toString(), value: 0 },
];

export const TimeSeriesNode = ({
  externalId,
  dataPoints = DEFAULT_RANGE,
}: {
  externalId: string;
  dataPoints?: { timestamp: string; value: any }[];
}) => {
  const [resourceId, setResourceId] = useState<number | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    getCogniteSDKClient()
      .timeseries.retrieve([{ externalId }])
      .then(([{ id }]) => setResourceId(id));
  }, [externalId]);

  const dateRange = useMemo(() => {
    const range = (dataPoints.length > 0 ? dataPoints : DEFAULT_RANGE).map(
      (el) => new Date(el.timestamp)
    );
    range.sort((a, b) => a.getTime() - b.getTime());
    return [range[0], range[range.length - 1]] as [Date, Date];
  }, [dataPoints]);
  return (
    <Flex direction="column" gap={4}>
      <Flex gap={6}>
        <Button
          style={{ flex: 1 }}
          size="small"
          disabled={!resourceId}
          icon={isOpen ? 'ChevronUp' : 'ChevronDown'}
          onClick={() => setIsOpen(!isOpen)}
        />
        <Button
          style={{ flex: 1 }}
          size="small"
          icon="ExternalLink"
          disabled={!resourceId}
          onClick={() =>
            window.open(
              createLink(
                `/explore/timeSeries/${resourceId}${window.location.search}`
              )
            )
          }
        />
      </Flex>
      {isOpen && resourceId && (
        <TimeseriesChart
          timeseriesId={resourceId}
          variant="small"
          height={100}
          dateRange={dateRange}
        />
      )}
    </Flex>
  );
};
