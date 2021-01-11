import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import ITable from './ITable';
import { getMockResponse } from '../../utils/mockResponse';
import { getIntegrationTableCol, TableHeadings } from './IntegrationTableCol';
import { renderWithSelectedIntegrationContext } from '../../utils/test/render';

describe('<ITable/>', () => {
  const cols = getIntegrationTableCol();
  const mockIntegration = getMockResponse()[0];
  beforeEach(() => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    renderWithSelectedIntegrationContext(
      <ITable data={getMockResponse()} columns={cols} />,
      { initIntegration: mockIntegration, client: new QueryClient() }
    );
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Render without errors', () => {
    const colsWithHeaders = Object.entries(TableHeadings).map(([_, v]) => v);
    colsWithHeaders.forEach((heading) => {
      const header = screen.getByText(heading);
      expect(header).toBeInTheDocument();
    });
  });

  test('render and interact with row selection', () => {
    const sapLabel = screen.getByText(getMockResponse()[1].name);
    fireEvent.click(sapLabel);
    expect(
      (sapLabel as HTMLButtonElement).getAttribute('aria-selected')
    ).toEqual('true');
    const azureLabel = screen.getByText(getMockResponse()[0].name);
    fireEvent.click(azureLabel);
    expect(
      (azureLabel as HTMLButtonElement).getAttribute('aria-selected')
    ).toEqual('true');
    expect(
      (sapLabel as HTMLButtonElement).getAttribute('aria-selected')
    ).toEqual('false');
  });

  test('render and interact with sort on header: Name', () => {
    const nameHeader = screen.getByText(/name/i);
    const body = screen.getAllByRole('row');
    const firsRowContent = body[1].textContent;
    expect(firsRowContent).toContain('Azure Integration');
    fireEvent.click(nameHeader); // to filter acending
    fireEvent.click(nameHeader); // to filter decending
    const body2 = screen.getAllByRole('row');
    const firstRowContentAfterClick = body2[1].textContent;
    expect(firstRowContentAfterClick).not.toContain('Azure Integration');
    expect(firsRowContent).not.toEqual(firstRowContentAfterClick);
  });

  test('render and interact with global filter', async () => {
    const searchInput = screen.getByPlaceholderText(/records/i);

    const searchName = {
      string: 'sap',
      regexp: /sap/i,
    };
    // should filter the sap integration
    fireEvent.change(searchInput, { target: { value: searchName.string } });
    await waitFor(() => {
      const resultRows = screen.getAllByText(searchName.regexp);
      expect(resultRows.length).toEqual(1);
    });

    // clear search should show all rows
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(getMockResponse().length + 1);
    });

    // should filter based name column
    const search = {
      string: 'birger',
      regexp: /birger/i,
    };
    fireEvent.change(searchInput, { target: { value: search.string } });
    await waitFor(() => {
      const b = screen.getAllByLabelText(search.regexp);
      expect(b.length).toEqual(1);
    });

    // should filter from created by col
    const searchJacek = {
      string: 'jacek',
      regexp: /jacek/i,
    };
    fireEvent.change(searchInput, { target: { value: searchJacek.string } });
    await waitFor(() => {
      const resultRows = screen.getAllByLabelText(searchJacek.regexp);
      expect(resultRows.length).toEqual(3);
    });

    // should filter from data sets by col
    const searchDataSet = {
      string: 'aker',
      regexp: /aker/i,
    };
    fireEvent.change(searchInput, { target: { value: searchDataSet.string } });
    await waitFor(() => {
      const resultRows = screen.getAllByText(searchDataSet.regexp);
      expect(resultRows.length).toEqual(1);
    });
  });

  test('render and interact with filter on status', () => {
    const nameHeader = screen.getByText(/status/i);
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
    expect(bodyOK.length).toEqual(2);
    const firsRowContent = bodyOK[1].textContent;
    expect(firsRowContent.toLowerCase().includes('ok')).toEqual(true);

    // click fail
    fireEvent.click(statusFailMenuItem);
    const bodyFail = screen.getAllByRole('row');
    expect(bodyFail.length).toEqual(4); // 3 fail + header
    const firsRowFail = bodyFail[1].textContent;
    expect(firsRowFail.toLowerCase().includes('fail')).toEqual(true);

    // click all
    fireEvent.click(statusAllMenuItem);
    const bodyAll = screen.getAllByRole('row');
    expect(bodyAll.length).toEqual(6); // 5 rows + header
  });
});
