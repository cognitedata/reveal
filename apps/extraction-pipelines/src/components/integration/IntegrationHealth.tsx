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
import { Colors } from '@cognite/cogs.js';
import {
  createSearchParams,
  getQueryParams,
  partition,
} from 'utils/integrationUtils';
import { Status } from 'model/Status';
import { TimeSelector } from 'components/inputs/dateTime/TimeSelector';
import { QuickDateTimeFilters } from 'components/table/QuickDateTimeFilters';
import { StatusFilterMenu } from 'components/table/StatusFilterMenu';
import { useHistory, useLocation } from 'react-router-dom';
import {
  updateDateRangeAction,
  updateSearchAction,
  updateStatusAction,
  useRunFilterContext,
} from 'hooks/runs/RunsFilterContext';
import moment from 'moment';

const TableWrapper = styled(PageWrapperColumn)`
  padding: 0 2rem;
`;
const FilterWrapper = styled.div`
  display: flex;
  padding: 1rem;
  background-color: ${Colors['greyscale-grey2'].hex()};
  > :first-child,
  > :nth-child(2) {
    margin-right: 1rem;
  }
  > :nth-child(3),
  > :nth-child(4) {
    padding-right: 1rem;
    margin-right: 1rem;
    border-right: 1px solid ${Colors['greyscale-grey5'].hex()};
  }
  .cogs-btn-tertiary {
    height: 100%;
    background-color: ${Colors.white.hex()};
    &:hover {
      border: 1px solid ${Colors.primary.hex()};
    }
  }
  .cogs-input-container {
    flex: 1;
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
  const history = useHistory();

  const { search: urlSearch, pathname } = useLocation();
  const {
    search: paramSearch,
    statuses: paramStatuses,
    min,
    max,
    env,
  } = getQueryParams(urlSearch);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [pageSize] = useState(PAGE_SIZE_DEFAULT);
  const [pageCount, setPageCount] = React.useState(0);

  useEffect(() => {
    if (min && max) {
      const range = {
        startDate: moment(parseInt(min, 10)),
        endDate: moment(parseInt(max, 10)),
      };
      dispatch(
        updateDateRangeAction({
          startDate: range.startDate.toDate(),
          endDate: range.endDate.toDate(),
        })
      );
    }
    if (paramStatuses) {
      dispatch(updateStatusAction(paramStatuses.split(',') as RunStatus[]));
    }
    if (paramSearch) {
      dispatch(updateSearchAction(paramSearch));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    state: { dateRange, statuses, search },
    dispatch,
  } = useRunFilterContext();
  const { data, error, isPreviousData } = useFilteredRuns({
    externalId: integration?.externalId,
    statuses,
    search,
    dateRange,
    nextCursor,
  });
  const { id: integrationId } = integration ?? {};

  useEffect(() => {
    if (integrationId) {
      trackUsage(SINGLE_INTEGRATION_RUNS, { id: integrationId });
    }
  }, [integrationId]);
  useEffect(() => {
    const url = `${pathname}?${createSearchParams({
      env,
      search,
      statuses,
      dateRange,
    })}`;

    history.push(url);
  }, [pathname, env, search, statuses, dateRange, history]);

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

  return (
    <TableWrapper>
      <FilterWrapper>
        <QuickDateTimeFilters />
        <DateRangeFilter />
        <TimeSelector />
        <StatusFilterMenu />
        <DebouncedSearch
          label={ERROR_SEARCH_LABEL}
          placeholder={MESSAGE_SEARCH_PLACEHOLDER}
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
