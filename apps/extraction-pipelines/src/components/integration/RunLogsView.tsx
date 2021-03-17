import React, { FunctionComponent, PropsWithChildren, useEffect } from 'react';
import styled from 'styled-components';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_INTEGRATION_RUNS } from 'utils/constants';
import { useRuns } from 'hooks/useRuns';
import { StatusRun } from 'model/Runs';
import { Integration } from 'model/Integration';
import { Wrapper } from 'components/integration/IntegrationView';
import { filterRuns } from 'utils/runsUtils';
import { RunLogsTable } from 'components/integration/RunLogsTable';
import { getRunLogTableCol } from 'components/integration/RunLogsCols';
import { ErrorFeedback } from 'components/error/ErrorFeedback';

const TableWrapper = styled(Wrapper)`
  padding: 0 2rem;
`;
interface LogsViewProps {
  integration: Integration | null;
}

export const RunLogsView: FunctionComponent<LogsViewProps> = ({
  integration,
}: PropsWithChildren<LogsViewProps>) => {
  const { data, error } = useRuns(integration?.externalId);
  const integrationId = integration?.id;
  useEffect(() => {
    if (integrationId) {
      trackUsage(SINGLE_INTEGRATION_RUNS, { id: integrationId });
    }
  }, [integrationId]);
  const columns = getRunLogTableCol();
  if (error) {
    return <ErrorFeedback error={error} />;
  }
  const statuses: StatusRun[] = filterRuns(data?.items);
  return (
    <TableWrapper>
      <RunLogsTable data={statuses} columns={columns} />
    </TableWrapper>
  );
};
