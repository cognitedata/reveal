import React from 'react';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries, DataSet } from '@cognite/sdk';
import {
  DetailsItem,
  DetailsTabGrid,
  DetailsTabItem,
  TimeDisplay,
} from 'lib/components';
import { formatMetadata } from 'lib/utils';

export default function TimeseriesDetails({
  timeseries,
  datasetLink,
}: {
  timeseries: Timeseries;
  datasetLink?: string;
}) {
  const { data: dataset } = useCdfItem<DataSet>(
    'datasets',
    { id: timeseries?.dataSetId || 0 },
    { enabled: !!timeseries && !!timeseries?.dataSetId }
  );
  return (
    <>
      <DetailsTabGrid>
        <DetailsTabItem name="Description" value={timeseries?.description} />
        <DetailsTabItem name="Unit" value={timeseries?.unit} />
        <DetailsTabItem
          name="External ID"
          value={timeseries?.externalId}
          copyable
        />
        <DetailsTabItem name="ID" value={timeseries?.id} copyable />
        <DetailsTabItem
          name="Data set"
          value={dataset?.name}
          link={datasetLink}
        />
        <DetailsTabItem
          name="Created at"
          value={
            timeseries ? (
              <TimeDisplay value={timeseries.createdTime} />
            ) : (
              'Loading...'
            )
          }
        />
        <DetailsTabItem
          name="Updated at"
          value={
            timeseries ? (
              <TimeDisplay value={timeseries.lastUpdatedTime} />
            ) : (
              'Loading...'
            )
          }
        />
      </DetailsTabGrid>
      {timeseries?.metadata && (
        <>
          <h2>Metadata</h2>
          {formatMetadata(timeseries?.metadata).map(el => (
            <DetailsItem key={el.key} name={el.key} value={el.value} />
          ))}
        </>
      )}
    </>
  );
}
