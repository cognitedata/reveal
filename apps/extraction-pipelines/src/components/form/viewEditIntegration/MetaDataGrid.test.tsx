import { QueryClient } from 'react-query';
import { act } from 'react-test-renderer';
import { screen } from '@testing-library/react';
import React from 'react';
import { renderQueryCacheIntegration } from '../../../utils/test/render';
import { render } from '../../../utils/test';
import { getMockResponse } from '../../../utils/mockResponse';
import { DetailFieldNames, Integration } from '../../../model/Integration';
import { MetaDataGrid } from './MetaDataGrid';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../../utils/baseURL';

function createIntegrationMetadata(
  metadata: object | undefined | null
): Integration {
  const int = getMockResponse()[0];
  return { ...int, metadata } as Integration;
}

describe('MetaData', () => {
  let client: QueryClient;
  beforeEach(() => {
    client = new QueryClient();
  });
  test('Should render when there is matadata', async () => {
    const testValue = 'this is a test';
    const metaData = createIntegrationMetadata({ test: testValue });
    const thisWrapper = renderQueryCacheIntegration(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      metaData
    );
    act(() => {
      render(<MetaDataGrid />, { wrapper: thisWrapper });
    });
    expect(screen.queryByText('Test')).toBeInTheDocument();
    expect(screen.queryByText(testValue)).toBeInTheDocument();
  });

  test('Should render when metadata is empty object', async () => {
    const metaData = createIntegrationMetadata({});
    const thisWrapper = renderQueryCacheIntegration(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      metaData
    );
    act(() => {
      render(<MetaDataGrid />, { wrapper: thisWrapper });
    });
    const renderedMetadata = screen.queryByText(DetailFieldNames.META_DATA);
    expect(renderedMetadata).toBeInTheDocument();
    expect(screen.queryByTestId('meta-label-0')).not.toBeInTheDocument();
  });

  test('Should render when metadata is undefined', async () => {
    const metaData = createIntegrationMetadata(undefined);
    const thisWrapper = renderQueryCacheIntegration(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      metaData
    );
    act(() => {
      render(<MetaDataGrid />, { wrapper: thisWrapper });
    });
    const renderedMetadata = screen.queryByText(DetailFieldNames.META_DATA);
    expect(renderedMetadata).toBeInTheDocument();
    expect(screen.queryByTestId('meta-label-0')).not.toBeInTheDocument();
    expect(screen.queryByText(/no metadata/i)).toBeInTheDocument();
  });

  test('Should render when metadata is null', async () => {
    const metaData = createIntegrationMetadata(null);
    const thisWrapper = renderQueryCacheIntegration(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      metaData
    );
    act(() => {
      render(<MetaDataGrid />, { wrapper: thisWrapper });
    });
    const renderedMetadata = screen.queryByText(DetailFieldNames.META_DATA);
    expect(renderedMetadata).toBeInTheDocument();
    expect(screen.queryByTestId('meta-label-0')).not.toBeInTheDocument();
    expect(screen.queryByText(/no metadata/i)).toBeInTheDocument();
  });
});
