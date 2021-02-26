import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import ConnectRawTablesPage, {
  INTEGRATION_CONNECT_RAW_TABLES_HEADING,
  TABLE_REQUIRED,
} from './ConnectRawTablesPage';
import {
  DBS_LABEL,
  TABLES_LABEL,
} from '../../components/inputs/rawSelector/RawSelector';
import { NEXT } from '../../utils/constants';
import {
  databaseListMock,
  dbResponse,
  table2Response,
  tableResponse,
} from '../../utils/mockResponse';
import { useRawDBAndTables } from '../../hooks/useRawDBAndTables';

jest.mock('../../hooks/useRawDBAndTables', () => {
  return {
    useRawDBAndTables: jest.fn(),
  };
});
describe('ConnectRawTablesPage', () => {
  const dbMock = dbResponse.items;
  const tableMock = tableResponse.items;
  const tableMock2 = table2Response.items;
  const mockData = databaseListMock;
  let wrapper;
  beforeEach(() => {
    const context = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      `create/integration-contacts`
    );
    wrapper = context.wrapper;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Renders', () => {
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    render(<ConnectRawTablesPage />, { wrapper });
    expect(
      screen.getByText(INTEGRATION_CONNECT_RAW_TABLES_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByText(DBS_LABEL)).toBeInTheDocument();
    expect(screen.getByText(TABLES_LABEL)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    useRawDBAndTables.mockReturnValue({
      isLoading: false,
      data: mockData,
    });
    render(<ConnectRawTablesPage />, { wrapper });
    const db1 = await screen.findByLabelText(dbMock[0].name);
    expect(db1).toBeInTheDocument();
    const db2 = await screen.findByLabelText(dbMock[1].name);
    expect(db2).toBeInTheDocument();
    // select db1
    fireEvent.click(db1);
    // expect tables of db1 to appear and be selected
    const dbAfterClick = await screen.findByLabelText(dbMock[0].name);
    expect(dbAfterClick.checked).toEqual(true);
    const table1 = await screen.findByLabelText(tableMock[0].name);
    const table2 = await screen.findByLabelText(tableMock[1].name);
    expect(table1).toBeInTheDocument();
    expect(table1.checked).toEqual(true);
    expect(table2).toBeInTheDocument();
    expect(table2.checked).toEqual(true);
    // click on one tabel to deselect
    fireEvent.click(table2);
    expect(table2.checked).toEqual(false);
    // click on other db
    fireEvent.click(db2);
    // expect table of db1 to not be visible
    expect(table1).not.toBeInTheDocument();
    expect(table2).not.toBeInTheDocument();
    // expect tables of db2 to be visible
    const db2Table1 = screen.getByLabelText(tableMock2[0].name);
    expect(db2Table1).toBeInTheDocument();
    expect(db2Table1.checked).toEqual(true);
  });
  test('Requires one table to be selected', async () => {
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    render(<ConnectRawTablesPage />, { wrapper });
    const next = screen.getByText(NEXT);
    fireEvent.click(next);
    expect(screen.getByText(TABLE_REQUIRED)).toBeInTheDocument();
  });
});
