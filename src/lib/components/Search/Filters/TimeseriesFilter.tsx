import React from 'react';
import {
  IsStepFilter,
  IsStringFilter,
  UnitFilter,
} from 'lib/containers/Timeseries';
import { useList } from '@cognite/sdk-react-query-hooks';
import { useResourceFilter } from 'lib/context';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ExternalIDPrefixFilter } from './ExternalIDPrefixFilter/ExternalIDPrefixFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';

export default function TimeseriesFilter() {
  const filter = useResourceFilter('timeSeries');
  const { data: items = [] } = useList('assets', { filter, limit: 1000 });
  return (
    <div>
      <UnitFilter items={items} />,
      <DataSetFilter resourceType="timeSeries" />
      <ByAssetFilter resourceType="timeSeries" />
      <IsStepFilter />
      <IsStringFilter />
      <ExternalIDPrefixFilter resourceType="timeSeries" />
      <MetadataFilter resourceType="timeSeries" items={items} />
    </div>
  );
}
