import { FileInfo } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { AggregatedFilterV2, MetadataFilterV2 } from 'components';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { transformNewFilterToOldFilter } from 'domain/transformers';

import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from 'components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from 'components/PreviewFilter/PreviewFilter';
import { InternalCommonFilters } from 'domain/types';
import { useDebounce } from 'use-debounce';
import { InternalFilesFilters } from 'domain/files';
import { convertResourceType } from 'types';
import { useResourceResults } from '../SearchResultLoader';
import { FileTable } from 'containers/Files';

interface Props {
  defaultFilter: InternalCommonFilters;
  onClick: (item: FileInfo) => void;
}

const LinkedFileFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalFilesFilters;
  onFilterChange: (newValue: InternalFilesFilters) => void;
}) => {
  const { data: items = [] } = useList('files', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <AggregatedFilterV2
        items={items}
        aggregator="mimeType"
        title="Mime type"
        value={filter.mimeType}
        setValue={newValue => onFilterChange({ mimeType: newValue })}
      />
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={newValue => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

export const FileLinkedSearchResults: React.FC<Props> = ({
  defaultFilter,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalFilesFilters>({});
  // const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const filesFilter = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);

  const api = convertResourceType('file');
  const { canFetchMore, fetchMore, items } = useResourceResults<FileInfo>(
    api,
    debouncedQuery,
    filesFilter
  );

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  return (
    <FileTable
      id="file-linked-search-results"
      onRowClick={file => onClick(file)}
      data={items}
      enableSorting
      // onSort={props => setSortBy(props)}
      showLoadButton
      tableSubHeaders={
        <AppliedFiltersTags
          filter={appliedFilters}
          onFilterChange={setFilter}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <LinkedFileFilter
            filter={filter}
            onFilterChange={newValue =>
              setFilter(prevState => ({ ...prevState, ...newValue }))
            }
          />
        </DefaultPreviewFilter>
      }
      hasNextPage={canFetchMore}
      fetchMore={fetchMore}
    />
  );
};
