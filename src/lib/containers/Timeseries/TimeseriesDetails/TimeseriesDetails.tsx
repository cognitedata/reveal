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
      <DetailsTabItem name="Name" value={timeseries.name} copyable />
      <DetailsTabItem name="Description" value={timeseries.description} />
      <DetailsTabItem name="Unit" value={timeseries.unit} />
      <DetailsTabItem name="ID" value={timeseries.id} copyable />
      <DetailsTabItem
        name="External ID"
        value={timeseries.externalId}
        copyable
      />
      <DetailsTabItem
        name="Is String"
        value={timeseries.isString ? 'True' : 'False'}
      />
      <DetailsTabItem
        name="Is Step"
        value={timeseries.isStep ? 'True' : 'False'}
      />
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
