import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import { QueryClient } from 'react-query';
import { trackUsage } from 'utils/Metrics';
import { NAVIGATION } from 'utils/constants';
import { renderWithReactQueryCacheProvider } from 'utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import ExtractorDownloadsLink from './ExtractorDownloadsLink';

describe('ExtractorDownloadsTab', () => {
  let client: QueryClient;
  let wrapper;
  beforeEach(() => {
    client = new QueryClient();
    wrapper = renderWithReactQueryCacheProvider(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV
    );
  });
  test('Render page and link with path', () => {
    render(
      <ExtractorDownloadsLink
        linkText="Download Extractors"
        link={{ path: '/extractors' }}
      />,
      { wrapper }
    );
    const downloadLink = screen.getByText(/download extractors/i);
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink.href).toEqual(
      'http://localhost/itera-int-green/extractors?env=greenfield'
    );
  });

  test('Render page and link with url', () => {
    const url = 'https://docs.cognite.com/cdf/integration/';
    render(
      <ExtractorDownloadsLink linkText="Download Extractors" link={{ url }} />,
      { wrapper }
    );
    const downloadLink = screen.getByText(/download extractors/i);
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink.href).toEqual(url);
  });

  test('Tracks click', () => {
    const url = 'https://docs.cognite.com/cdf/integration/';
    render(
      <ExtractorDownloadsLink linkText="Download Extractors" link={{ url }} />,
      { wrapper }
    );
    const downloadLink = screen.getByText(/download extractors/i);
    expect(downloadLink).toBeInTheDocument();
    fireEvent.click(downloadLink);
    expect(trackUsage).toHaveBeenCalledTimes(1);
    expect(trackUsage).toHaveBeenCalledWith(NAVIGATION, { href: url });
  });
});
