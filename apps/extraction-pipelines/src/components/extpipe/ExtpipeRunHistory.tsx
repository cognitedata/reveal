import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { useFilteredRuns } from 'hooks/useRuns';
import { RunUI } from 'model/Runs';
import { Extpipe } from 'model/Extpipe';
import { RunLogsTable } from 'components/extpipe/RunLogsTable';
import { getRunLogTableCol } from 'components/extpipe/RunLogsCols';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import { PageWrapperColumn, Span3 } from 'components/styled';
import { DebouncedSearch } from 'components/inputs/DebouncedSearch';
import { DateRangeFilter } from 'components/inputs/dateTime/DateRangeFilter';
import { Colors, Loader } from '@cognite/cogs.js';
import {
  createSearchParams,
  getQueryParams,
  partition,
} from 'utils/extpipeUtils';
import { RunStatusUI } from 'model/Status';
import { TimeSelector } from 'components/inputs/dateTime/TimeSelector';
import { QuickDateTimeFilters } from 'components/table/QuickDateTimeFilters';
import { StatusFilterMenu } from 'components/table/StatusFilterMenu';
import { useHistory, useLocation } from 'react-router-dom';
import { useRunFilterContext } from 'hooks/runs/RunsFilterContext';
import { RunChart } from 'components/chart/RunChart';
import {
  DateFormatRecordType,
  DateFormatsRecord,
  mapRangeToGraphTimeFormat,
} from 'components/chart/runChartUtils';
import { useFlag } from '@cognite/react-feature-flags';
import { ErrorBox } from 'components/error/ErrorBox';
import { SectionWithoutHeader } from 'components/extpipe/Section';
import { trackUsage } from 'utils/Metrics';
import { DEFAULT_ITEMS_PER_PAGE } from 'utils/constants';
import { TranslationKeys, useTranslation } from 'common';
import { isForbidden } from 'utils/utils';
interface LogsViewProps {
  extpipe: Extpipe | null;
}
export interface RangeType {
  startDate: Date;
  endDate: Date;
}

export const renderError = (
  error: Error & { status: number },
  _t: (key: TranslationKeys) => string
) => {
  return !isForbidden(error.status) ? (
    <ErrorFeedback error={error} />
  ) : (
    <PageWrapperColumn>
      <ErrorBox heading={_t('no-access')}>
        <p>
          {_t('no-access-desc')}
          <code>extractionruns:read</code>.
        </p>
      </ErrorBox>
    </PageWrapperColumn>
  );
};

export const ExtpipeRunHistory: FunctionComponent<LogsViewProps> = ({
  extpipe,
}: PropsWithChildren<LogsViewProps>) => {
  const { t } = useTranslation();
  const [all, setAll] = useState<RunUI[]>([]);
  const [runsList, setRunsList] = useState<RunUI[]>([]);
  const [timeFormat, setTimeFormat] = useState<DateFormatRecordType>(
    DateFormatsRecord.DATE_FORMAT
  );
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [pageSize] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [pageCount, setPageCount] = React.useState(0);
  const chartEnabled = useFlag('EXTPIPES_CHART_allowlist', {
    fallback: false,
    forceRerender: true,
  });
  const history = useHistory();
  const { id: extpipeId } = extpipe ?? {};
  useEffect(() => {
    if (extpipeId) {
      trackUsage({ t: 'Extraction pipeline.Health', id: extpipeId });
    }
  }, [extpipeId]);
  const { search: urlSearch, pathname } = useLocation();
  const { env, cluster } = getQueryParams(urlSearch);

  const {
    state: { dateRange, statuses, search },
  } = useRunFilterContext();

  const { data, error, isPreviousData, isFetching } = useFilteredRuns({
    externalId: extpipe?.externalId,
    statuses,
    search,
    dateRange,
    nextCursor,
  });

  useEffect(() => {
    setTimeFormat(mapRangeToGraphTimeFormat(dateRange));
  }, [dateRange, setTimeFormat]);

  useEffect(() => {
    const url = `${pathname}?${createSearchParams({
      env,
      search,
      statuses,
      dateRange,
      cluster,
    })}`;
    history.push(url);
    setAll([]);
    setRunsList([]);
    setNextCursor(undefined);
  }, [pathname, env, search, statuses, dateRange, history, cluster]);

  useEffect(() => {
    if (!isPreviousData && data) {
      const { pass: runsData } = partition(data.runs, (item) => {
        return item.status !== RunStatusUI.SEEN;
      });
      setAll(data.runs);
      setRunsList(runsData);
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
    return renderError(error, t);
  }

  const columns = getRunLogTableCol(t);

  return (
    <TableWrapper>
      <div style={{ height: '2rem' }} />
      <SectionWithoutHeader>
        <FilterWrapper>
          <QuickDateTimeFilters />
          <DateRangeFilter />
          <TimeSelector />
          <StatusFilterMenu />
          <DebouncedSearch
            label={t('search-err-message')}
            placeholder={t('search-err-message-placeholder')}
          />
        </FilterWrapper>
        {isFetching ? (
          <Loader />
        ) : (
          <div style={{ margin: '1rem' }}>
            {chartEnabled && all?.length ? (
              <RunChart allRuns={all} timeFormat={timeFormat} />
            ) : null}
            <RunLogsTable
              data={runsList}
              columns={columns}
              pageCount={pageCount}
              fetchData={fetchData}
              pageSize={pageSize}
              extpipe={extpipe}
            />
          </div>
        )}
      </SectionWithoutHeader>
    </TableWrapper>
  );
};

const TableWrapper = styled(PageWrapperColumn)`
  ${Span3};
  padding: 0 2rem;
`;

const FilterWrapper = styled.div`
  display: flex;
  padding: 1rem;
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
