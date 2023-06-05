import { useMemo } from 'react';

import { Button } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';
import { Timeseries } from '@cognite/sdk/dist/src';
import { useInfiniteSearch } from '@cognite/sdk-react-query-hooks';

import { SearchResults } from '../../../components/search/SearchResults';
import { Table } from '../../../components/table/Table';
import { useNavigation } from '../../../hooks/useNavigation';
import { useSearchQueryParams } from '../../../hooks/useParams';

import { PAGE_SIZE } from './constants';

const columns = [
  { header: 'Name', accessorKey: 'name' },
  {
    header: 'Preview',
    accessorKey: 'data',
    size: 400,
    cell: ({ row }: any) => {
      const timeseries = row.original;

      return (
        <TimeseriesChart
          timeseriesId={timeseries.id}
          variant="small"
          numberOfPoints={100}
          height={55}
          dataFetchOptions={{
            mode: 'aggregate',
          }}
          autoRange
        />
      );
    },
  },
  { header: 'id', accessorKey: 'externalId' },
  { header: 'Description', accessorKey: 'description' },
  { header: 'Type', accessorKey: 'type' },
  { header: 'Unit', accessorKey: 'unit' },
];

export const TimeseriesResults = () => {
  const [query] = useSearchQueryParams();
  const navigate = useNavigation();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteSearch<Timeseries>('timeseries', query, PAGE_SIZE);

  const results = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data]);

  return (
    <SearchResults empty={results.length === 0}>
      <SearchResults.Header title="Time series" />

      <SearchResults.Body>
        <Table
          id="timeseries"
          data={results}
          columns={columns}
          onRowClick={(row) => {
            navigate.toTimeseriesPage(row.externalId || row.id);
          }}
        />
      </SearchResults.Body>

      <SearchResults.Footer>
        <Button
          type="ghost"
          disabled={!hasNextPage}
          onClick={() => {
            fetchNextPage();
          }}
          loading={isFetchingNextPage}
        >
          Show more
        </Button>
      </SearchResults.Footer>
    </SearchResults>
  );
};
