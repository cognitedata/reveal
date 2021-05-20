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
  display: flex;
  padding: 1rem 0;
  background-color: ${Colors['greyscale-grey2'].hex()};
`;
interface LogsViewProps {
  integration: Integration | null;
}
const ERROR_SEARCH_LABEL: Readonly<string> = 'Search error message';

export interface RangeType {
  startDate: Date;
  endDate: Date;
}

export const IntegrationHealth: FunctionComponent<LogsViewProps> = ({
  integration,
}: PropsWithChildren<LogsViewProps>) => {
  const [runs, setRuns] = useState<StatusRun[]>([]);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: moment(Date.now()).subtract(1, 'week').toDate(),
    endDate: moment(Date.now()).toDate(),
  });
  const [status, setStatus] = useState<RunStatus | undefined>();
  const [search, setSearch] = useState<string>();
  const { data, error } = useFilteredRuns({
    filter: {
      externalId: integration?.externalId ?? '',
      ...(dateRange.endDate && dateRange.startDate
        ? {
            createdTime: {
              max: dateRange.endDate.getTime(),
              min: dateRange.startDate.getTime(),
            },
          }
        : {}),
      ...(status && { status }),
      message: {
        substring: search,
      },
    },
    limit: 100,
  });
  const integrationId = integration?.id;
  useEffect(() => {
    if (integrationId) {
      trackUsage(SINGLE_INTEGRATION_RUNS, { id: integrationId });
    }
  }, [integrationId]);

  useEffect(() => {
    if (data) {
      const statusRows = mapStatusRow(data?.items);
      const { fail: runsData } = partition(statusRows, (item) => {
        return item.status === Status.SEEN;
      });
      setRuns(runsData);
    }
  }, [data]);

  const columns = getRunLogTableCol();
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
        <DateRangeFilter
          dateRange={dateRange}
          dateRangeChanged={dateRangeChanged}
        />
        <TimeSelector
          dateRange={dateRange}
          dateRangeChanged={dateRangeChanged}
        />
        <QuickDateTimeFilters setDateRange={setDateRange} />
        <StatusFilterMenu setStatus={setStatus} />
        <DebouncedSearch
          label={ERROR_SEARCH_LABEL}
          handleChange={handleSearchChange}
        />
      </FilterWrapper>
      <RunLogsTable data={runs} columns={columns} />
    </TableWrapper>
  );
};
