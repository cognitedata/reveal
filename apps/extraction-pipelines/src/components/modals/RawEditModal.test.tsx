import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient } from 'react-query';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { RawEditModal } from 'components/modals/RawEditModal';
import { databaseListMock, getMockResponse } from 'utils/mockResponse';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { render } from 'utils/test';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { DetailFieldNames } from 'model/Integration';
import { useRawDBAndTables } from 'hooks/useRawDBAndTables';

jest.mock('hooks/useRawDBAndTables', () => {
  return {
    useRawDBAndTables: jest.fn(),
  };
});
describe('RawEditModal', () => {
  const mockData = databaseListMock;

  let wrapper = null;
  let client: QueryClient;
  const integration = getMockResponse()[0];
  const cancelMock = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
    client = new QueryClient();
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('class', 'integrations-ui-style-scope');
    document.body.appendChild(modalRoot);
  });
  afterEach(() => {
    wrapper = null;
  });

  test('Renders stored raw tables', async () => {
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    // sdkv3.post.mockResolvedValue({ data: { items: [integrationsResponse] } });
    sdkv3.get.mockResolvedValue({ data: integration });
    render(<RawEditModal visible onCancel={cancelMock} />, {
      wrapper: wrapper.wrapper,
    });
    expect(screen.getByText(DetailFieldNames.RAW_TABLE)).toBeInTheDocument();
    const storedDb = integration.rawTables[0].dbName;
    await waitFor(() => {
      expect(screen.getByText(storedDb)).toBeInTheDocument();
    });
    // eslint-disable-next-line no-unused-expressions
    integration?.rawTables?.forEach(({ dbName, tableName }) => {
      expect(screen.getByText(dbName)).toBeInTheDocument();
      expect(screen.getByText(tableName)).toBeInTheDocument();
    });
  });
});
