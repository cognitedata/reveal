import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_EXT_PIPE_RUNS } from 'utils/constants';
import { useFilteredRuns } from 'hooks/useRuns';
import { RunUI } from 'model/Runs';
import { Integration } from 'model/Integration';
import { RunLogsTable } from 'components/integration/RunLogsTable';
import { getRunLogTableCol } from 'components/integration/RunLogsCols';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import { PageWrapperColumn } from 'styles/StyledPage';
import { DebouncedSearch } from 'components/inputs/DebouncedSearch';
import { DateRangeFilter } from 'components/inputs/dateTime/DateRangeFilter';
import { Colors, Loader } from '@cognite/cogs.js';
import {
  createSearchParams,
  getQueryParams,
  partition,
} from 'utils/integrationUtils';
import { RunStatusUI } from 'model/Status';
import { TimeSelector } from 'components/inputs/dateTime/TimeSelector';
import { QuickDateTimeFilters } from 'components/table/QuickDateTimeFilters';
import { StatusFilterMenu } from 'components/table/StatusFilterMenu';
import { useHistory, useLocation } from 'react-router-dom';
import { useRunFilterContext } from 'hooks/runs/RunsFilterContext';
import { RunChart } from 'components/chart/RunChart';
import { GroupByTimeFormat } from 'components/chart/runChartUtils';

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
  const [all, setAll] = useState<RunUI[]>([]);
  const [runsList, setRunsList] = useState<RunUI[]>([]);
  const [timeFormat] = useState<GroupByTimeFormat>('YYYY-MM-DD HH');
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [pageSize] = useState(PAGE_SIZE_DEFAULT);
  const [pageCount, setPageCount] = React.useState(0);
  const history = useHistory();
  const { id: integrationId } = integration ?? {};
  useEffect(() => {
    if (integrationId) {
      trackUsage(SINGLE_EXT_PIPE_RUNS, { id: integrationId });
    }
  }, [integrationId]);
  const { search: urlSearch, pathname } = useLocation();
  const { env } = getQueryParams(urlSearch);

  const {
    state: { dateRange, statuses, search },
  } = useRunFilterContext();

  const { data, error, isPreviousData, isFetching } = useFilteredRuns({
    externalId: integration?.externalId,
    statuses,
    search,
    dateRange,
    nextCursor,
  });

  useEffect(() => {
    if (integrationId) {
      trackUsage(SINGLE_EXT_PIPE_RUNS, { id: integrationId });
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
    setAll([]);
    setRunsList([]);
    setNextCursor(undefined);
  }, [pathname, env, search, statuses, dateRange, history]);

  useEffect(() => {
    if (!isPreviousData && data) {
      const { pass: runsData } = partition(data.runs, (item) => {
        return item.status !== RunStatusUI.SEEN;
      });
      setAll((prev) => {
        return [...prev, ...data.runs];
      });
      setRunsList((prev) => {
        return [...prev, ...runsData];
      });
    }
  }, [data, isPreviousData]);

  const fetchData = React.useCallback(
    ({ pageSize: innerPageSize }) => {
      if (!isPreviousData && data?.nextCursor) {
        setNextCursor(data.nextCursor);
      }
      setPageCount(Math.ceil(runsList.length / innerPageSize));
    },
    [data, isPreviousData, runsList.length]
  );

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  const columns = getRunLogTableCol();

  function renderContent(fetching: boolean) {
    if (fetching) {
      return <Loader />;
    }
    return (
      <>
        <RunChart
          allRuns={all}
          byTimeFormat={timeFormat}
          timeFormat={timeFormat}
        />
        <RunLogsTable
          data={runsList}
          columns={columns}
          pageCount={pageCount}
          fetchData={fetchData}
          pageSize={pageSize}
        />
      </>
    );
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
      {renderContent(isFetching)}
    </TableWrapper>
  );
};
