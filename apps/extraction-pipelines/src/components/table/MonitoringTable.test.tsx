import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import MonitoringTable from './MonitoringTable';
import {
  getMonitoringTableCol,
  MonitoringTableHeadings,
} from '../table/MonitoringTableCol';
import { mockDataRunsResponse } from '../../utils/mockResponse';
import mapRuns from '../../utils/runsUtils';

describe('<MonitoringTable/>', () => {
  const columns = getMonitoringTableCol();
  const tableData = mapRuns(mockDataRunsResponse.items);
  test('Render without errors', () => {
    render(<MonitoringTable data={tableData} columns={columns} />);
    const colsWithHeaders = Object.entries(MonitoringTableHeadings).map(
      ([_, v]) => v
    );
    colsWithHeaders.forEach((h) => {
      const header = screen.getByText(h);
      expect(header).toBeInTheDocument();
    });

    const allRows = screen.getAllByRole('row');
    expect(allRows.length).toEqual(7);
  });

  test('Check expand functionality', () => {
    render(<MonitoringTable data={tableData} columns={columns} />);
    const firsRowContent = screen.getAllByRole('row')[1];
    fireEvent.click(firsRowContent);
    const allRows = screen.getAllByRole('row');
    expect(allRows.length).toEqual(9);
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
