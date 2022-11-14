import { Sequence } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { MetadataFilterV2 } from 'components';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { transformNewFilterToOldFilter } from 'domain/transformers';

import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from 'components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from 'components/PreviewFilter/PreviewFilter';
import { InternalCommonFilters } from 'domain/types';
import { InternalSequenceFilters } from 'domain/sequence';
import {
  SequenceNewTable,
  SequenceWithRelationshipLabels,
  useResourceResults,
} from 'containers';
import { convertResourceType } from 'types';
import { useDebounce } from 'use-debounce';

interface Props {
  defaultFilter: InternalCommonFilters;
  onClick: (item: Sequence | SequenceWithRelationshipLabels) => void;
}

const LinkedSequenceFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalSequenceFilters;
  onFilterChange: (newValue: InternalSequenceFilters) => void;
}) => {
  const { data: items = [] } = useList('sequences', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={newValue => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

export const SequenceLinkedSearchResults: React.FC<Props> = ({
  defaultFilter,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalSequenceFilters>({});
  // const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const sequenceFilter = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);

  const api = convertResourceType('sequence');
  const { canFetchMore, fetchMore, items } = useResourceResults<Sequence>(
    api,
    debouncedQuery,
    sequenceFilter
  );

  // const { data, hasNextPage, fetchNextPage } = useSequenceSearchResultQuery({
  //   query: debouncedQuery,
  //   filter: sequenceFilter,
  //   sortBy,
  // });

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  return (
    <SequenceNewTable
      id="sequence-linked-search-results"
      onRowClick={sequence => onClick(sequence)}
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
          <LinkedSequenceFilter
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
