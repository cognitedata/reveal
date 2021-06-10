import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { renderRegisterContext } from 'utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  getBaseUrl,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import {
  DATA_SET_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import { useDataSetsList } from 'hooks/useDataSetsList';
import { datasetMockResponse } from 'utils/mockResponse';
import { BACK, NEXT } from 'utils/constants';
import DataSetPage, {
  CREATE_DATA_SET_LABEL,
  DATA_SET_TIP,
  DataSetOptions,
  INTEGRATION_DATA_SET_HEADING,
} from 'pages/create/DataSetPage';
import { RegisterIntegrationInfo } from 'model/Integration';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { DATA_SET_REQUIRED } from 'utils/validation/integrationSchemas';
import { TableHeadings } from 'components/table/IntegrationTableCol';

jest.mock('hooks/useDataSetsList', () => {
  return {
    useDataSetsList: jest.fn(),
  };
});
describe('DatasetPage', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: DATA_SET_PAGE_PATH,
    initRegisterIntegration: {},
  };
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Renders', () => {
    const mock = datasetMockResponse();
    useDataSetsList.mockReturnValue({
      data: mock,
      status: 'success',
    });
    renderRegisterContext(<DataSetPage />, { ...props });
    expect(screen.getByText(INTEGRATION_DATA_SET_HEADING)).toBeInTheDocument();
    expect(screen.getByText(DATA_SET_TIP)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const mock = datasetMockResponse();
    useDataSetsList.mockReturnValue({
      data: mock,
      status: 'success',
    });
    renderRegisterContext(<DataSetPage />, { ...props });
    const yesOption = screen.getByLabelText(DataSetOptions.YES);
    expect(yesOption).not.toBeChecked();
    const noOption = screen.getByLabelText(DataSetOptions.NO);
    expect(noOption).not.toBeChecked();
    const createOption = screen.getByLabelText(CREATE_DATA_SET_LABEL);
    expect(createOption).not.toBeChecked();
    fireEvent.click(noOption);
    await waitFor(() => {
      expect(noOption).toBeChecked();
    });
    fireEvent.click(yesOption);
    await waitFor(() => {
      screen.getByLabelText(TableHeadings.DATA_SET);
    });
    const dataSetIdInput = screen.getByLabelText(TableHeadings.DATA_SET);
    expect(dataSetIdInput).toBeInTheDocument();
    fireEvent.click(dataSetIdInput);
    fireEvent.keyDown(dataSetIdInput, { key: 'Down', code: 'ArrowDown' });
    fireEvent.keyDown(dataSetIdInput, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText(mock.items[0].name)).toBeInTheDocument();
    fireEvent.click(dataSetIdInput);
    fireEvent.keyDown(dataSetIdInput, { key: 'Delete', code: 'Delete' });
    expect(screen.queryByText(mock.items[0].name)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      screen.getByText(DATA_SET_REQUIRED);
    });
    expect(screen.getByText(DATA_SET_REQUIRED)).toBeInTheDocument();
  });
  test('Back btn path', () => {
    const mock = datasetMockResponse();
    useDataSetsList.mockReturnValue({
      data: mock,
      status: 'success',
    });
    renderRegisterContext(<DataSetPage />, { ...props });
    const back = screen.getByText(BACK);
    const linkPath = back.getAttribute('href');
    expect(linkPath.includes(SCHEDULE_PAGE_PATH)).toEqual(true);
  });

  test('Loads stored value', () => {
    const mock = datasetMockResponse();
    useDataSetsList.mockReturnValue({
      data: mock,
      status: 'success',
    });
    const initIntegration: Partial<RegisterIntegrationInfo> = {
      dataSetId: mock.items[0].id,
    };
    renderRegisterContext(<DataSetPage />, {
      ...props,
      initRegisterIntegration: initIntegration,
    });
    expect(screen.getByLabelText(DataSetOptions.YES)).toBeChecked();
    expect(
      screen.getByDisplayValue(initIntegration.dataSetId)
    ).toBeInTheDocument();
    expect(screen.getByText(mock.items[0].name)).toBeInTheDocument();
  });

  test('Nothing selected if stored dataset does not exist', () => {
    const mock = datasetMockResponse();
    useDataSetsList.mockReturnValue({
      data: mock,
      status: 'success',
    });
    const initIntegration: Partial<RegisterIntegrationInfo> = {
      dataSetId: '123123123123123',
    };
    renderRegisterContext(<DataSetPage />, {
      ...props,
      initRegisterIntegration: initIntegration,
    });
    expect(screen.getByLabelText(DataSetOptions.YES)).not.toBeChecked();
    expect(screen.getByLabelText(DataSetOptions.NO)).not.toBeChecked();
    expect(screen.getByLabelText(CREATE_DATA_SET_LABEL)).not.toBeChecked();

    const dataSetIdInput = screen.queryByText(TableHeadings.DATA_SET);
    expect(dataSetIdInput).not.toBeInTheDocument();
  });

  test('Call to update when data set id is set', async () => {
    const mock = datasetMockResponse();
    useDataSetsList.mockReturnValue({
      data: mock,
      status: 'success',
    });
    sdkv3.post.mockResolvedValue({ data: { items: [] } });
    const initIntegration: Partial<RegisterIntegrationInfo> = {
      id: 123,
      dataSetId: mock.items[0].id,
    };
    renderRegisterContext(<DataSetPage />, {
      ...props,
      initRegisterIntegration: initIntegration,
    });
    expect(screen.getByLabelText(DataSetOptions.YES)).toBeChecked();
    expect(screen.getByDisplayValue(mock.items[0].id)).toBeInTheDocument();
    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
    expect(sdkv3.post).toHaveBeenCalledWith(
      `${getBaseUrl(PROJECT_ITERA_INT_GREEN)}/update`,
      {
        data: {
          items: [
            {
              id: '123',
              update: { dataSetId: { set: mock.items[0].id } },
            },
          ],
        },
        withCredentials: true,
      }
    );
  });

  test('Call to update when NO option is selected', async () => {
    const mock = datasetMockResponse();
    useDataSetsList.mockReturnValue({
      data: mock,
      status: 'success',
    });
    sdkv3.post.mockResolvedValue({ data: { items: [] } });
    const initIntegration: Partial<RegisterIntegrationInfo> = {
      id: 123,
      dataSetId: undefined,
    };
    renderRegisterContext(<DataSetPage />, {
      ...props,
      initRegisterIntegration: initIntegration,
    });
    const noOption = screen.getByLabelText(DataSetOptions.NO);
    fireEvent.click(noOption);
    expect(noOption).toBeChecked();
    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
    expect(sdkv3.post).toHaveBeenCalledWith(
      `${getBaseUrl(PROJECT_ITERA_INT_GREEN)}/update`,
      {
        data: {
          items: [{ id: '123', update: { dataSetId: { set: undefined } } }],
        },
        withCredentials: true,
      }
    );
  });
});
