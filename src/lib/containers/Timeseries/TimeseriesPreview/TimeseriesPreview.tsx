import { Icon } from '@cognite/cogs.js';
import { DescriptionList } from '@cognite/gearbox/dist/components/DescriptionList';
import { Timeseries } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ErrorFeedback, Loader, Splitter, Wrapper } from 'lib/components';
import { TimeseriesGraph } from 'lib/containers/Timeseries';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';
import React from 'react';

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

  const { data: relationships } = useRelationships(timeseries?.externalId);

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!timeseries) {
    return <>Timeseries {timeseriesId} not found!</>;
  }

  return (
    <Wrapper>
      <h1>
        <Icon type="Timeseries" />
        {timeseries ? timeseries.name : 'Loading...'}
      </h1>
      {extraActions}
      {timeseries && (
        <Splitter>
          <div>
            <TimeseriesGraph
              timeseries={timeseries}
              contextChart
              graphHeight={500}
            />
            <DescriptionList
              valueSet={formatMetadata(timeseries.metadata ?? {})}
            />
          </div>
          <ResourceDetailsSidebar
            assetId={timeseries.assetId}
            relations={relationships}
          />
        </Splitter>
      )}
    </Wrapper>
  );
};
