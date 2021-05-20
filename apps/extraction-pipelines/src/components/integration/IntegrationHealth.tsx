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
import { Colors } from '@cognite/cogs.js';
import { partition } from 'utils/integrationUtils';
import { Status } from 'model/Status';
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

export const IntegrationHealth: FunctionComponent<LogsViewProps> = ({
  integration,
}: PropsWithChildren<LogsViewProps>) => {
  const [runs, setRuns] = useState<StatusRun[]>([]);
  const [status, setStatus] = useState<RunStatus | undefined>();
  const { data, error } = useFilteredRuns({
    filter: {
      externalId: integration?.externalId ?? '',
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
        <StatusFilterMenu setStatus={setStatus} />
      </FilterWrapper>
      <RunLogsTable data={runs} columns={columns} />
    </TableWrapper>
  );
};
