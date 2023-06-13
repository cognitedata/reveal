import isEmpty from 'lodash/isEmpty';

import { Button } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';

import { SearchResults } from '../../../components/search/SearchResults';
import { Table } from '../../../components/table/Table';
import { useNavigation } from '../../../hooks/useNavigation';
import {
  useDataTypeFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useTimeseriesSearchQuery } from '../../../services/instances/timeseries';
import { buildTimeseriesFilter } from '../../../utils/filterBuilder';

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
  const navigate = useNavigation();
  const [query] = useSearchQueryParams();
  const [timeseriesFilterParams] = useDataTypeFilterParams('Timeseries');

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useTimeseriesSearchQuery(
      query,
      PAGE_SIZE,
      buildTimeseriesFilter(timeseriesFilterParams)
    );

  return (
    <SearchResults empty={isEmpty(data)}>
      <SearchResults.Header title="Time series" />

      <SearchResults.Body>
        <Table
          id="timeseries"
          data={data}
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
