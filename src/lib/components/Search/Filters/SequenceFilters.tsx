import React from 'react';
import { useResourceFilter } from 'lib/context';
import { useList } from '@cognite/sdk-react-query-hooks';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ExternalIDPrefixFilter } from './ExternalIDPrefixFilter/ExternalIDPrefixFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';

export default function SequenceFilters() {
  const filter = useResourceFilter('sequence');
  const { data: items = [] } = useList('sequences', { filter, limit: 1000 });
  return (
    <div>
      <DataSetFilter resourceType="sequence" />
      <ExternalIDPrefixFilter resourceType="sequence" />
      <ByAssetFilter resourceType="sequence" />
      <MetadataFilter resourceType="sequence" items={items} />
    </div>
  );
}
