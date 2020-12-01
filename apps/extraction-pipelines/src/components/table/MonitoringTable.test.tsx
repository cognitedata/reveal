import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import MonitoringTable from './MonitoringTable';
import { getMonitoringTableCol } from '../table/MonitoringTableCol';
import { mockDataRunsResponse } from '../../utils/mockResponse';
import mapRuns from '../../utils/runsUtils';

describe('<MonitoringTable/>', () => {
  const columns = getMonitoringTableCol();
  const tableData = mapRuns(mockDataRunsResponse.items);
  test('Render without errors', () => {
    render(<MonitoringTable data={tableData} columns={columns} />);
    const colsWithHeaders = columns.filter((col) => col.Header);
    colsWithHeaders.forEach(({ Header }) => {
      const header = screen.getByText(Header);
      expect(header).toBeInTheDocument();
    });
  });

  test('render and interact with filter on status', () => {
    render(<MonitoringTable data={tableData} columns={columns} />);

    const nameHeader = screen.getByText(/Status run/i);
    fireEvent.click(nameHeader); // open status menu

    const statusFailMenuItem = screen.getByTestId(
      'status-marker-status-menu-fail'
    );
    const statusOKMenuItem = screen.getByTestId('status-marker-status-menu-ok');
    const statusAllMenuItem = screen.getByTestId('status-menu-all');
    expect(statusAllMenuItem).toBeInTheDocument();
    expect(statusOKMenuItem).toBeInTheDocument();
    expect(statusFailMenuItem).toBeInTheDocument();

    // click ok
    fireEvent.click(statusOKMenuItem);
    const bodyOK = screen.getAllByRole('row');
    expect(bodyOK.length).toEqual(5);
    const firsRowContent = bodyOK[1].textContent;
    expect(firsRowContent.toLowerCase().includes('ok')).toEqual(true);
    // click fail
    fireEvent.click(statusFailMenuItem);
    const bodyFail = screen.getAllByRole('row');
    expect(bodyFail.length).toEqual(3); // 2 fail + header
    const firsRowFail = bodyFail[1].textContent;
    expect(firsRowFail.toLowerCase().includes('fail')).toEqual(true);

    // click all
    fireEvent.click(statusAllMenuItem);
    const bodyAll = screen.getAllByRole('row');
    expect(bodyAll.length).toEqual(7); // 5 rows + header
  });
});
