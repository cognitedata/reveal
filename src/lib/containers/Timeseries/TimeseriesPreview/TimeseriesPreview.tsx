import React from 'react';
import { Icon } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import {
  Loader,
  ErrorFeedback,
  Wrapper,
  DetailsItem,
  Splitter,
} from 'lib/components';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { formatMetadata } from 'lib/utils';
import { ResourceDetailsSidebar } from 'lib/containers/ResoureDetails';
import { useRelationships } from 'lib/hooks/RelationshipHooks';

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
            <TimeseriesChart
              timeseriesId={timeseries.id}
              height={500}
              defaultOption="2Y"
            />
            {formatMetadata((timeseries && timeseries.metadata) ?? {}).map(
              el => (
                <DetailsItem key={el.key} name={el.key} value={el.value} />
              )
            )}
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
