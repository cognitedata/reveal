import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_INTEGRATION_RUNS } from 'utils/constants';
import { useFilteredRuns } from 'hooks/useRuns';
import { StatusRun } from 'model/Runs';
import { Integration } from 'model/Integration';
import { mapStatusRow, RunStatus } from 'utils/runsUtils';
import { RunLogsTable } from 'components/integration/RunLogsTable';
import { getRunLogTableCol } from 'components/integration/RunLogsCols';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import { PageWrapperColumn } from 'styles/StyledPage';
import { DebouncedSearch } from 'components/inputs/DebouncedSearch';
import { DateRangeFilter } from 'components/inputs/dateTime/DateRangeFilter';
import moment from 'moment';
import { Colors, Range } from '@cognite/cogs.js';
import { partition } from 'utils/integrationUtils';
import { Status } from 'model/Status';
import { TimeSelector } from 'components/inputs/dateTime/TimeSelector';
import { QuickDateTimeFilters } from 'components/table/QuickDateTimeFilters';
import { StatusFilterMenu } from 'components/table/StatusFilterMenu';

const TableWrapper = styled(PageWrapperColumn)`
  padding: 0 2rem;
`;
const FilterWrapper = styled.div`
  display: grid;
  grid-template-columns: min-content min-content min-content max-content auto;
  grid-column-gap: 1rem;
  padding: 1rem 1rem 1rem 0;
  background-color: ${Colors['greyscale-grey2'].hex()};
  .cogs-btn-tertiary {
    height: 100%;
    background-color: ${Colors.white.hex()};
    &:hover {
      border: 1px solid ${Colors.primary.hex()};
    }
  }
  .cogs-input-container {
    .addons-input-wrapper {
      height: 100%;
      .cogs-input {
        height: 100%;
      }
    }
  }
`;
interface LogsViewProps {
  integration: Integration | null;
}
export const PAGE_SIZE_DEFAULT: Readonly<number> = 10;
const ERROR_SEARCH_LABEL: Readonly<string> = 'Search error message';
const MESSAGE_SEARCH_PLACEHOLDER: Readonly<string> = 'Search in messages';

export interface RangeType {
  startDate: Date;
  endDate: Date;
}

export const IntegrationHealth: FunctionComponent<LogsViewProps> = ({
  integration,
}: PropsWithChildren<LogsViewProps>) => {
  const [runs, setRuns] = useState<StatusRun[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [pageSize] = useState(PAGE_SIZE_DEFAULT);
  const [pageCount, setPageCount] = React.useState(0);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: moment(Date.now()).subtract(1, 'week').toDate(),
    endDate: moment(Date.now()).toDate(),
  });
  const [status, setStatus] = useState<RunStatus | undefined>();
  const [search, setSearch] = useState<string>();

  const { data, error, isPreviousData } = useFilteredRuns({
    externalId: integration?.externalId,
    status,
    search,
    dateRange,
    nextCursor,
  });
  const integrationId = integration?.id;

  useEffect(() => {
    if (integrationId) {
      trackUsage(SINGLE_INTEGRATION_RUNS, { id: integrationId });
    }
  }, [integrationId]);

  useEffect(() => {
    if (!isPreviousData && data) {
      const statusRows = mapStatusRow(data?.items);
      const { pass: runsData } = partition(statusRows, (item) => {
        return item.status !== Status.SEEN;
      });
      setRuns(runsData);
    }
  }, [data, isPreviousData]);

  const columns = getRunLogTableCol();

  const fetchData = React.useCallback(
    ({ pageSize: innerPageSize }) => {
      if (!isPreviousData && data?.nextCursor) {
        setNextCursor(data.nextCursor);
      }
      setPageCount(Math.ceil(runs.length / innerPageSize));
    },
    [data, isPreviousData, runs.length]
  );

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  const handleSearchChange = (input: string) => {
    setSearch(input);
  };

  const dateRangeChanged = (range: Range) => {
    setDateRange(range);
  };

  return (
    <TableWrapper>
      <FilterWrapper>
        <QuickDateTimeFilters setDateRange={setDateRange} />
        <DateRangeFilter
          dateRange={dateRange}
          dateRangeChanged={dateRangeChanged}
        />
        <TimeSelector
          dateRange={dateRange}
          dateRangeChanged={dateRangeChanged}
        />
        <StatusFilterMenu setStatus={setStatus} />
        <DebouncedSearch
          label={ERROR_SEARCH_LABEL}
          placeholder={MESSAGE_SEARCH_PLACEHOLDER}
          handleChange={handleSearchChange}
        />
      </FilterWrapper>
      <RunLogsTable
        data={runs}
        columns={columns}
        pageCount={pageCount}
        fetchData={fetchData}
        pageSize={pageSize}
      />
    </TableWrapper>
  );
};
