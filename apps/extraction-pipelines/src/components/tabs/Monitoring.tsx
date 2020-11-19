import React from 'react';
import StyledTable from '../../styles/StyledTable';
import { mockDataRunsResponse } from '../../utils/mockResponse';
import mapRuns from '../../utils/runsUtils';
import { getMonitoringTableCol } from '../table/MonitoringTableCol';
import MonitoringTable from '../table/MonitoringTable';

const Monitoring = () => {
  const data = mapRuns(mockDataRunsResponse);

  const columns = getMonitoringTableCol();

  return (
    <StyledTable>
      <MonitoringTable data={data} columns={columns} />
    </StyledTable>
  );
};

export default Monitoring;
