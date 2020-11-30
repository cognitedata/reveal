import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'utils/test';
import { QueryCache } from 'react-query';
import ExtractorDownloadsLink from './ExtractorDownloadsLink';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderWithReactQueryCacheProvider,
} from '../../utils/test/render';

describe('ExtractorDownloadsTab', () => {
  test('Render page and link with path', () => {
    const queryCache = new QueryCache();
    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV
    );
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
    const queryCache = new QueryCache();
    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV
    );
    render(
      <ExtractorDownloadsLink linkText="Download Extractors" link={{ url }} />,
      { wrapper }
    );
    const downloadLink = screen.getByText(/download extractors/i);
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink.href).toEqual(url);
  });
});
