import React from 'react';
import { SubtreeFilter } from 'lib/containers/Assets';
import { useList } from '@cognite/sdk-react-query-hooks';
import { useResourceFilter } from 'lib/context';
import { SourceFilter } from './SourceFilter/SourceFilter';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ExternalIDPrefixFilter } from './ExternalIDPrefixFilter/ExternalIDPrefixFilter';

export default function AssetFilters() {
  const filter = useResourceFilter('asset');
  const { data: items = [] } = useList('assets', { filter, limit: 1000 });
  return (
    <div>
      <LabelFilter resourceType="asset" />
      <DataSetFilter resourceType="asset" />
      <SourceFilter resourceType="asset" items={items} />
      <ExternalIDPrefixFilter resourceType="asset" />
      <SubtreeFilter />
      <MetadataFilter resourceType="asset" items={items} />
    </div>
  );
}
