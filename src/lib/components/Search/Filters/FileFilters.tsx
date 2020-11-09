import React from 'react';

import {
  DirectoryPrefixFilter,
  MimeTypeFilter,
  UploadedFilter,
} from 'lib/containers/Files';
import { useResourceFilter } from 'lib/context';
import { useList } from '@cognite/sdk-react-query-hooks';
import { SourceFilter } from './SourceFilter/SourceFilter';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ExternalIDPrefixFilter } from './ExternalIDPrefixFilter/ExternalIDPrefixFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';

export default function FileFilters() {
  const filter = useResourceFilter('file');
  const { data: items = [] } = useList('files', { filter, limit: 1000 });
  return (
    <div>
      <LabelFilter resourceType="file" />
      <DataSetFilter resourceType="file" />
      <MimeTypeFilter items={items} />
      <ByAssetFilter resourceType="file" />
      <UploadedFilter />
      <ExternalIDPrefixFilter resourceType="file" />
      <DirectoryPrefixFilter />
      <SourceFilter resourceType="file" items={items} />
      <MetadataFilter resourceType="file" items={items} />
    </div>
  );
}
