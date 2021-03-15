import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { renderRegisterContext } from 'utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { RAW_TABLE_PAGE_PATH } from 'routing/CreateRouteConfig';
import { databaseListMock } from 'utils/mockResponse';
import RawTablePage, {
  INTEGRATION_RAW_TABLE_HEADING,
  RAW_TABLE_TIP,
  RawTableOptions,
} from 'pages/create/RawTablePage';
import { useRawDBAndTables } from 'hooks/useRawDBAndTables';
import { TABLE_REQUIRED } from 'components/inputs/rawSelector/ConnectRawTablesInput';
import { NEXT } from 'utils/constants';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';

jest.mock('hooks/useRawDBAndTables', () => {
  return {
    useRawDBAndTables: jest.fn(),
  };
});
describe('RawTablePage', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: RAW_TABLE_PAGE_PATH,
    initRegisterIntegration: {},
  };
  const mockData = databaseListMock;

  test('Renders', () => {
    renderRegisterContext(<RawTablePage />, { ...props });
    expect(screen.getByText(INTEGRATION_RAW_TABLE_HEADING)).toBeInTheDocument();
    expect(screen.getByText(RAW_TABLE_TIP)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    renderRegisterContext(<RawTablePage />, { ...props });
    const yesOption = screen.getByLabelText(RawTableOptions.YES);
    expect(yesOption).not.toBeChecked();
    const noOption = screen.getByLabelText(RawTableOptions.NO);
    expect(noOption.getAttribute('checked')).toBeNull();
    expect(noOption).not.toBeChecked();
    fireEvent.click(noOption);
    await waitFor(() => {
      expect(noOption).toBeChecked();
      expect(noOption.getAttribute('checked')).toBeDefined();
    });

    fireEvent.click(yesOption);

    const db1 = await screen.findByLabelText(mockData[0].database.name);
    expect(db1).toBeInTheDocument();
    const db2 = await screen.findByLabelText(mockData[1].database.name);
    expect(db2).toBeInTheDocument();
    // select db1
    fireEvent.click(db1);
    // expect tables of db1 to appear and be selected
    await waitFor(() => {
      screen.getByLabelText(mockData[0].database.name);
    });
    const dbAfterClick = screen.getByLabelText(mockData[0].database.name);
    expect(dbAfterClick).toBeChecked();
    const table1 = await screen.findByLabelText(mockData[0].tables[0].name);
    const table2 = await screen.findByLabelText(mockData[0].tables[1].name);
    expect(table1).toBeInTheDocument();
    expect(table1).toBeChecked();
    expect(table2).toBeInTheDocument();
    expect(table2).toBeChecked();
    // click on one tabel to deselect
    fireEvent.click(table2);
    expect(table2).not.toBeChecked();
    // click on other db
    fireEvent.click(db2);
    // expect table of db1 to not be visible
    expect(table1).not.toBeInTheDocument();
    expect(table2).not.toBeInTheDocument();
    // expect tables of db2 to be visible
    const db2Table1 = screen.getByLabelText(mockData[1].tables[0].name);
    expect(db2Table1).toBeInTheDocument();
    expect(db2Table1).toBeChecked();
  });

  test('Requires one table to be selected', async () => {
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    renderRegisterContext(<RawTablePage />, { ...props });
    fireEvent.click(screen.getByText(RawTableOptions.YES));
    const next = screen.getByText(NEXT);
    fireEvent.click(next);
    await waitFor(() => {
      screen.getByText(TABLE_REQUIRED);
    });
    expect(screen.getByText(TABLE_REQUIRED)).toBeInTheDocument();
  });

  test('Loads stored value', async () => {
    const rawTables = [
      {
        dbName: mockData[0].database.name,
        tableName: mockData[0].tables[0].name,
      },
    ];
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    renderRegisterContext(<RawTablePage />, {
      ...props,
      initRegisterIntegration: { rawTables },
    });
    expect(screen.getByLabelText(RawTableOptions.YES)).toBeChecked();

    expect(screen.getByLabelText(rawTables[0].dbName)).toBeChecked();
    // selected db and listing in table
    expect(screen.getAllByText(rawTables[0].dbName).length).toEqual(2);
    // listing in table (selected table is not possible because if tables from multiple dbs are selected)
    expect(screen.getByText(rawTables[0].tableName)).toBeInTheDocument();
  });

  test('Calls to update on yes', async () => {
    const rawTables = [
      {
        dbName: mockData[0].database.name,
        tableName: mockData[0].tables[0].name,
      },
    ];
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    sdkv3.post.mockResolvedValue({ data: { items: [] } });
    renderRegisterContext(<RawTablePage />, {
      ...props,
      initRegisterIntegration: { rawTables, id: 123 },
    });
    expect(screen.getByLabelText(RawTableOptions.YES)).toBeChecked();
    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
    expect(sdkv3.post).toHaveBeenCalledWith(
      '/api/playground/projects/itera-int-green/integrations/update',
      {
        data: {
          items: [{ id: '123', update: { rawTables: { set: rawTables } } }],
        },
        withCredentials: true,
      }
    );
  });

  test('Calls to update on no', async () => {
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    sdkv3.post.mockResolvedValue({ data: { items: [] } });
    renderRegisterContext(<RawTablePage />, {
      ...props,
      initRegisterIntegration: { id: 123 },
    });
    fireEvent.click(screen.getByLabelText(RawTableOptions.NO));
    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });

    expect(sdkv3.post).toHaveBeenCalledWith(
      '/api/playground/projects/itera-int-green/integrations/update',
      {
        data: {
          items: [{ id: '123', update: { rawTables: { set: [] } } }],
        },
        withCredentials: true,
      }
    );
  });
});
