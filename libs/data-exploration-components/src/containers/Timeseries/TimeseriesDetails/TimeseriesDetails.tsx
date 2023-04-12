import React from 'react';
import { Timeseries } from '@cognite/sdk';
import { GeneralDetails } from '@data-exploration-components/components';
import { TimeseriesLastReading } from '../TimeseriesLastReading/TimeseriesLastReading';
import { TimeDisplay } from '@data-exploration/components';

export function TimeseriesDetails({ timeseries }: { timeseries: Timeseries }) {
  return (
    <GeneralDetails>
      <GeneralDetails.Item
        name="Name"
        key={`Name${timeseries.name}`}
        value={timeseries.name}
        copyable
      />
      <GeneralDetails.Item name="Description" value={timeseries.description} />
      <GeneralDetails.Item name="Unit" value={timeseries.unit} />
      <GeneralDetails.Item
        name="ID"
        key={`ID${timeseries.id}`}
        value={timeseries.id}
        copyable
      />
      <GeneralDetails.Item
        key={`External_ID${timeseries.externalId}`}
        name="External ID"
        value={timeseries.externalId}
        copyable
      />
      <GeneralDetails.Item
        name="Is String"
        value={timeseries.isString ? 'True' : 'False'}
      />
      <GeneralDetails.Item
        name="Is Step"
        value={timeseries.isStep ? 'True' : 'False'}
      />
      <GeneralDetails.DataSetItem id={timeseries.id} type="timeSeries" />
      <GeneralDetails.AssetsItem
        assetIds={timeseries.assetId ? [timeseries.assetId] : undefined}
        linkId={timeseries.id}
        type="timeSeries"
      />
      <GeneralDetails.Item
        name="Created at"
        value={<TimeDisplay value={timeseries.createdTime} />}
      />
      <GeneralDetails.Item
        name="Updated at"
        value={<TimeDisplay value={timeseries.lastUpdatedTime} />}
      />
      <GeneralDetails.Item
        name="Last reading"
        value={<TimeseriesLastReading timeseriesId={timeseries.id} />}
      />
    </GeneralDetails>
  );
}
