import React, { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { useRuns } from '../../hooks/useRuns';
import { StatusRun } from '../../model/Runs';
import { RunLogsTable } from './RunLogsTable';
import { Integration } from '../../model/Integration';
import { Wrapper } from './IntegrationView';
import { getRunLogTableCol } from './RunLogsCols';
import { ErrorFeedback } from '../error/ErrorFeedback';
import { filterRuns } from '../../utils/runsUtils';

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
  const columns = getRunLogTableCol();
  if (error) {
    return <ErrorFeedback error={error} />;
  }
  const statuses: StatusRun[] = filterRuns(data);
  return (
    <TableWrapper>
      <RunLogsTable data={statuses} columns={columns} />
    </TableWrapper>
  );
};
