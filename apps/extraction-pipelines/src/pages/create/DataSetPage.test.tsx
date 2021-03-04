import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { renderRegisterContext } from '../../utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import DataSetPage, {
  CREATE_DATA_SET_LABEL,
  DATA_SET_TIP,
  DataSetOptions,
  INTEGRATION_DATA_SET_HEADING,
} from './DataSetPage';
import { DATA_SET_PAGE_PATH } from '../../routing/CreateRouteConfig';
import { DATA_SET_ID_LABEL, DATA_SET_ID_REQUIRED } from './DataSetIdInput';
import { useDataSetsList } from '../../hooks/useDataSetsList';
import { datasetMockResponse } from '../../utils/mockResponse';
import { NEXT } from '../../utils/constants';

jest.mock('../../hooks/useDataSetsList', () => {
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
  test('Renders', () => {
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
    expect(yesOption.getAttribute('aria-checked')).toEqual('false');
    const noOption = screen.getByLabelText(DataSetOptions.NO);
    expect(noOption.getAttribute('aria-checked')).toEqual('false');
    const createOption = screen.getByLabelText(CREATE_DATA_SET_LABEL);
    expect(createOption.getAttribute('aria-checked')).toEqual('false');
    fireEvent.click(noOption);
    await waitFor(() => {
      expect(noOption.getAttribute('aria-checked')).toEqual('true');
    });
    fireEvent.click(yesOption);
    await waitFor(() => {
      screen.getByLabelText(DATA_SET_ID_LABEL);
    });
    const dataSetIdInput = screen.getByLabelText(DATA_SET_ID_LABEL);
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
      screen.getByText(DATA_SET_ID_REQUIRED);
    });
    expect(screen.getByText(DATA_SET_ID_REQUIRED)).toBeInTheDocument();
  });
});
