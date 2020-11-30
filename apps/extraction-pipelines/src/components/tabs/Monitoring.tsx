import React from 'react';
import StyledTable from '../../styles/StyledTable';
import mapRuns from '../../utils/runsUtils';
import { getMonitoringTableCol } from '../table/MonitoringTableCol';
import MonitoringTable from '../table/MonitoringTable';
import { useRuns } from '../../hooks/useRuns';
import { ErrorFeedback } from '../error/ErrorFeedback';

export interface MonitoringProps {
  externalId: string;
}

const Monitoring = ({ externalId }: MonitoringProps) => {
  const { data, error: errorRuns } = useRuns(externalId);

  if (errorRuns) {
    return <ErrorFeedback error={errorRuns} />;
  }

  const tableData = mapRuns(data ?? []);
  const columns = getMonitoringTableCol();

  return (
    <StyledTable>
      <MonitoringTable data={tableData} columns={columns} />
    </StyledTable>
  );
};

export default Monitoring;
