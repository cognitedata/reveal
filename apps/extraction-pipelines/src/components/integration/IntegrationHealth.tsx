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
import moment from 'moment';
import { Colors, Range } from '@cognite/cogs.js';
import { partition } from 'utils/integrationUtils';
import { Status } from 'model/Status';
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

  return (
    <TableWrapper>
      <FilterWrapper>
        <QuickDateTimeFilters setDateRange={setDateRange} />
        <StatusFilterMenu setStatus={setStatus} />
      </FilterWrapper>
      <RunLogsTable data={runs} columns={columns} />
    </TableWrapper>
  );
};
