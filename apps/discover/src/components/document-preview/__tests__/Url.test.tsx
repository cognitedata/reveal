import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { Url } from '../Url';

describe('Url', () => {
  const store = getMockedStore();

  const page = (viewProps?: any) => testRenderer(Url, store, viewProps);

  it('Shows the URL and the "ExternalLink" icon', () => {
    const url = 'https://discover.com';
    page({
      url,
    });

    expect(screen.getByText(url)).toBeInTheDocument();

    expect(
      screen.getByTestId('document-url-external-link-icon')
    ).toBeInTheDocument();

    expect(screen.getByTestId('document-url-copy-icon')).toBeInTheDocument();
  });

  it('Returns empty when URL is undefined', () => {
    const url = undefined;
    page({
      url,
    });

    expect(
      screen.queryByTestId('document-url-external-link-icon')
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId('document-url-url-icon')
    ).not.toBeInTheDocument();
  });
});
