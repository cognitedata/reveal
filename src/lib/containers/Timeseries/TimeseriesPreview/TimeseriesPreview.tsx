import React from 'react';
import { Icon } from '@cognite/cogs.js';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { Timeseries } from '@cognite/sdk';
import { Loader, ErrorFeedback, Wrapper } from 'lib/components';
import { useCdfItem } from 'lib/hooks/sdk';
import { TimeseriesGraph } from 'lib/containers/Timeseries';

const formatMetadata = (metadata: { [key: string]: any }) =>
  Object.keys(metadata).reduce(
    (agg, cur) => ({
      ...agg,
      [cur]: String(metadata[cur]) || '',
    }),
    {}
  );

export const TimeseriesPreview = ({
  timeseriesId,
  extraActions,
}: {
  timeseriesId: number;
  extraActions?: React.ReactNode[];
}) => {
  const { data: timeseries, isFetched, error } = useCdfItem<Timeseries>(
    'timeseries',
    { id: timeseriesId }
  );

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!timeseries) {
    return <>Sequence {timeseriesId} not found!</>;
  }

  return (
    <Wrapper>
      <h1>
        <Icon type="Timeseries" />
        {timeseries ? timeseries.name : 'Loading...'}
      </h1>
      {extraActions}
      {timeseries && (
        <>
          <TimeseriesGraph
            timeseries={timeseries}
            contextChart
            graphHeight={500}
          />
          <DescriptionList
            valueSet={formatMetadata(timeseries.metadata ?? {})}
          />
        </>
      )}
    </Wrapper>
  );
};
