import React from 'react';
import { render } from 'utils/test';
import { screen, waitFor } from '@testing-library/react';
import { getMockResponse } from 'utils/mockResponse';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { MetaData } from 'components/integration/MetaData';

describe('MetaData', () => {
  const mock = getMockResponse()[0];
  const metadata = {
    sourceSystem: 'Azure',
    documentation: 'Documentation should be displayed in a separate view',
    documentationLink: 'https://docs.cogntie.com',
    otherInformation: 'This can be used to what you want',
  };
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mock,
      '/'
    );
  });
  test('Should render metadata', async () => {
    sdkv3.get.mockResolvedValue({ data: { ...mock, metadata } });
    render(<MetaData />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(metadata.documentationLink);
    });
    expect(screen.getByText(metadata.documentationLink)).toBeInTheDocument();
    expect(screen.getByText(metadata.otherInformation)).toBeInTheDocument();
    expect(screen.queryByText(metadata.sourceSystem)).toBeInTheDocument(); // should be in separate view
    expect(screen.queryByText(metadata.documentation)).toBeInTheDocument(); // should be in separate view
  });

  test('Should render add metadata meta does not exist', () => {
    sdkv3.get.mockResolvedValue({ data: { ...mock, metadata: undefined } });
    render(<MetaData />, { wrapper: wrapper.wrapper });
    expect(screen.getByText(/add metadata/i)).toBeInTheDocument();
  });

  test('Should render add metadata meta when none to display exist', () => {
    sdkv3.get.mockResolvedValue({
      data: {
        ...mock,
        metadata: {
          sourceSystem: metadata.sourceSystem,
          documentation: metadata.documentation,
        },
      },
    });
    render(<MetaData />, { wrapper: wrapper.wrapper });
    expect(screen.getByText(/add metadata/i)).toBeInTheDocument();
  });
});
