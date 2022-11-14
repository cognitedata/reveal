import { Timeseries } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { AggregatedFilterV2, DateFilterV2, MetadataFilterV2 } from 'components';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { transformNewFilterToOldFilter } from 'domain/transformers';
import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from 'components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from 'components/PreviewFilter/PreviewFilter';
import { InternalCommonFilters } from 'domain/types';
import { InternalTimeseriesFilters } from 'domain/timeseries';
import { TimeseriesNewTable, useResourceResults } from 'containers';
import { convertResourceType } from 'types';
import { useDebounce } from 'use-debounce';

interface Props {
  defaultFilter: InternalCommonFilters;
  onClick: (item: Timeseries) => void;
}

const LinkedAssetFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalTimeseriesFilters;
  onFilterChange: (newValue: InternalTimeseriesFilters) => void;
}) => {
  const { data: items = [] } = useList('timeseries', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <AggregatedFilterV2
        items={items}
        aggregator="unit"
        title="Unit"
        value={filter.unit}
        setValue={newValue => onFilterChange({ unit: newValue })}
      />

      <DateFilterV2
        title="Updated Time"
        value={filter.lastUpdatedTime}
        setValue={newValue =>
          onFilterChange({ lastUpdatedTime: newValue || undefined })
        }
      />

      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={newValue => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

export const TimeseriesLinkedSearchResults: React.FC<Props> = ({
  defaultFilter,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalTimeseriesFilters>({});
  // const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const timeseriesFilters = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);
  const api = convertResourceType('timeSeries');

  const { canFetchMore, fetchMore, items } = useResourceResults<Timeseries>(
    api,
    debouncedQuery,
    timeseriesFilters
  );

  // const { data, hasNextPage, fetchNextPage } = useTimeseriesSearchResultQuery({
  //   // query: debouncedQuery,
  //   filter: timeseriesFilters,
  //   sortBy,
  // });

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  return (
    <TimeseriesNewTable
      id="timeseries-linked-search-results"
      onRowClick={asset => onClick(asset)}
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
          <LinkedAssetFilter
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
