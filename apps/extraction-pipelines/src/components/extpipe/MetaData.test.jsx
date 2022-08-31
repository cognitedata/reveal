import React from 'react';
import { render } from 'utils/test';
import { screen, waitFor } from '@testing-library/react';
import { getMockResponse } from 'utils/mockResponse';
import { renderWithReQueryCacheSelectedExtpipeContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import sdk from '@cognite/cdf-sdk-singleton';
import { useSDK } from '@cognite/sdk-provider';
import { MetaDataSection } from 'components/extpipe/MetaDataSection';
import { DetailFieldNames } from 'model/Extpipe';

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
    wrapper = renderWithReQueryCacheSelectedExtpipeContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mock,
      '/'
    );
  });
  test('Should render metadata', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.resolve({ data: { ...mock, metadata } }),
    });
    render(<MetaDataSection canEdit={false} />, {
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
    sdk.get.mockResolvedValue({ data: { ...mock, metadata: undefined } });
    render(<MetaDataSection canEdit />, { wrapper: wrapper.wrapper });
    expect(screen.getByTestId('add-field-btn')).toBeInTheDocument();
  });

  test('Should render add metadata meta when none to display exist', () => {
    sdk.get.mockResolvedValue({
      data: {
        ...mock,
        metadata: {
          sourceSystem: metadata.sourceSystem,
          documentation: metadata.documentation,
        },
      },
    });
    render(<MetaDataSection canEdit />, { wrapper: wrapper.wrapper });
    expect(screen.getByTestId('add-field-btn')).toBeInTheDocument();
  });
});
