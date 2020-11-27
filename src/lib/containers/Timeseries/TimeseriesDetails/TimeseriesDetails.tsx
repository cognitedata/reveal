import React from 'react';
import { Timeseries } from '@cognite/sdk';
import {
  DetailsTabGrid,
  DetailsTabItem,
  TimeDisplay,
  DataSetItem,
  AssetsItem,
} from 'lib/components';

export default function TimeseriesDetails({
  timeseries,
}: {
  timeseries: Timeseries;
}) {
  return (
    <DetailsTabGrid>
      <DetailsTabItem name="Description" value={timeseries.description} />
      <DetailsTabItem name="Unit" value={timeseries.unit} />
      <DetailsTabItem
        name="External ID"
        value={timeseries.externalId}
        copyable
      />
      <DetailsTabItem name="ID" value={timeseries.id} copyable />
      <DataSetItem id={timeseries.id} type="timeSeries" />
      <AssetsItem
        assetIds={timeseries.assetId ? [timeseries.assetId] : undefined}
        linkId={timeseries.id}
        type="timeSeries"
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
  );
}
