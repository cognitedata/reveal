import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { QueryClient } from 'react-query';
import { act } from '@testing-library/react-hooks';
import Extpipes from 'pages/Extpipes/Extpipes';
import { render } from 'utils/test';
import { getMockResponse, unauthorizedError } from 'utils/mockResponse';
import { renderWithReQueryCacheSelectedExtpipeContext } from 'utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { EXTRACTION_PIPELINES_ACL } from 'model/AclAction';

jest.mock('hooks/useRawDBAndTables', () => {
  return {
    useRawDBAndTables: jest.fn(),
  };
});

describe('Extpipes', () => {
  beforeEach(() => {
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] }],
    });
  });

  test('Render with out fail', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.resolve({ data: { items: getMockResponse() } }),
      datasets: {
        retrieve: () => Promise.resolve([]),
      },
    });
    const client = new QueryClient();
    const { wrapper } = renderWithReQueryCacheSelectedExtpipeContext(
      client,
      ORIGIN_DEV,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD
    );
    render(<Extpipes />, { wrapper });
    await waitFor(() => {
      const sidePanelHeading = screen.getByRole('grid');
      expect(sidePanelHeading).toBeInTheDocument();
    });
  });

  test('Should render "No extraction pipelines have been added yet." message when no extpipes', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.resolve({ data: { items: [] } }),
    });
    const queryCache = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      const { wrapper } = renderWithReQueryCacheSelectedExtpipeContext(
        queryCache,
        ORIGIN_DEV,
        PROJECT_ITERA_INT_GREEN,
        CDF_ENV_GREENFIELD
      );
      render(<Extpipes />, { wrapper });
      const errorMessage = await screen.findByText(
        /No extraction pipelines have been added yet./i
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('Render error on fail', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.reject(unauthorizedError),
    });
    const queryCache = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      const { wrapper } = renderWithReQueryCacheSelectedExtpipeContext(
        queryCache,
        ORIGIN_DEV,
        PROJECT_ITERA_INT_GREEN,
        CDF_ENV_GREENFIELD
      );
      render(<Extpipes />, { wrapper });
      const errorMessage = await screen.findByText(
        unauthorizedError.data.message
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('Render permission error when user dont have access', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.reject(unauthorizedError),
    });
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: [] }],
    });
    const queryCache = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      const { wrapper } = renderWithReQueryCacheSelectedExtpipeContext(
        queryCache,
        ORIGIN_DEV,
        PROJECT_ITERA_INT_GREEN,
        CDF_ENV_GREENFIELD
      );
      render(<Extpipes />, { wrapper });
      const errorMessage = await screen.findByText(
        `extractionPipelinesAcl:READ`
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
